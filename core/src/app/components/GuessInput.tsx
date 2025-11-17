"use client";

import "./guess-input.css";
import Fuse from "fuse.js";

import { useCallback, useMemo, useState } from "react";
import { queryWDQS } from "../../../lib/wdqs";
import { normalize } from "../../../lib/normalize";
import { transformGuess } from "../../../lib/special-cases";
import { AliasType, CategoryType, EntryType, GuessInputProps } from "./types";

const FUZZY_THRESHOLD = 0.1;
const LENGTH_DIFF_THRESHOLD = 3;

function buildCategoryQuery(updateSparql: string, guess: string): string {
  return updateSparql.replace("SEARCH_TERM", `${guess}`);
}

async function handleBinding(
  binding: any,
  guess: string,
  normalizedGuess: string,
  category: CategoryType,
  aliasHashMap: Map<string, AliasType>,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>
): Promise<EntryType | null> {
  const label = binding.itemLabel?.value ?? binding.item_label?.value;
  const url = binding.item?.value;
  const alias = binding.alias?.value;

  if (!label || !url) return null;

  const normalizedLabel = normalize(label);

  // If alias exists, check if label and alias is within threshold
  // If not, only check if label is within threshold
  let normalizedAlias;
  if (alias) {
    normalizedAlias = normalize(alias);

    if (
      Math.abs(normalizedLabel.length - normalizedGuess.length) >
        LENGTH_DIFF_THRESHOLD &&
      Math.abs(normalizedAlias.length - normalizedGuess.length) >
        LENGTH_DIFF_THRESHOLD
    ) {
      return null;
    }
  } else {
    if (
      Math.abs(normalizedLabel.length - normalizedGuess.length) >
      LENGTH_DIFF_THRESHOLD
    ) {
      return null;
    }
  }

  // Check if the guess matches the label or alias
  const matchesLabel = normalizedLabel === normalizedGuess;
  const matchesAlias = alias && normalizedAlias === normalizedGuess;

  if (!matchesLabel && !matchesAlias) {
    return null;
  }

  // Check if entry already exists in maps (from previous guesses in this session)
  if (entryByUrl.has(url)) {
    const existingEntry = entryByUrl.get(url)!;
    // Update maps with the alias if it matches
    if (matchesAlias && normalizedAlias) {
      aliasHashMap.set(normalizedAlias, {
        id: `temp-alias-${Date.now()}-${Math.random()}`,
        entryId: existingEntry.id,
        label: alias,
        norm: normalizedAlias,
      });
    }
    return existingEntry;
  }

  // Create new EntryType object without posting to database
  const newEntry: EntryType = {
    id: `temp-entry-${Date.now()}-${Math.random()}`,
    categoryId: category.id,
    label: label,
    norm: normalizedLabel,
    url: url,
  };

  // Update maps for potential future lookups in this session
  entryByNorm.set(normalizedLabel, newEntry);
  entryByUrl.set(url, newEntry);

  // If alias matches, also add it to the alias map
  if (matchesAlias && normalizedAlias) {
    aliasHashMap.set(normalizedAlias, {
      id: `temp-alias-${Date.now()}-${Math.random()}`,
      entryId: newEntry.id,
      label: alias,
      norm: normalizedAlias,
    });
  }

  return newEntry;
}

async function checkAndInsertDynamic(
  aliasHashMap: Map<string, AliasType>,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>,
  guess: string,
  category: CategoryType
): Promise<EntryType | null> {
  if (!category.updateSparql) return null;

  const sparqlWithGuess = buildCategoryQuery(category.updateSparql, guess);
  const data = await queryWDQS(sparqlWithGuess);

  if (data.results.bindings.length === 0) return null;

  const normalizedGuess = normalize(guess);
  console.log("Bindings: ", data.results.bindings);

  // Process bindings in parallel and return first successful match
  const bindingPromises = data.results.bindings.map((binding: any) =>
    handleBinding(
      binding,
      guess,
      normalizedGuess,
      category,
      aliasHashMap,
      entryByNorm,
      entryByUrl
    )
  );

  const results = await Promise.allSettled(bindingPromises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    }
  }

  return null;
}

function fuzzySearch<T extends { norm: string }>(
  fuse: Fuse<T>,
  guess: string,
  normalizedGuess: string
): T | null {
  if (normalizedGuess.length === 0) return null;

  const results = fuse.search(guess);

  if (
    results.length > 0 &&
    results[0].score &&
    results[0].score < FUZZY_THRESHOLD &&
    Math.abs(results[0].item.norm.length - normalizedGuess.length) <=
      LENGTH_DIFF_THRESHOLD
  ) {
    return results[0].item;
  }

  return null;
}

async function checkGuess(
  category: CategoryType,
  guess: string,
  aliasHashMap: Map<string, AliasType>,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>,
  entriesFuse: Fuse<EntryType>,
  aliasesFuse: Fuse<AliasType>,
  entryById: Map<string, EntryType>,
  isDynamic: boolean
): Promise<EntryType | null> {
  const transformedGuess = transformGuess(category.slug, guess);
  const normalizedGuess = normalize(transformedGuess);

  if (normalizedGuess.length === 0) return null;

  const correspondingEntry = entryByNorm.get(normalizedGuess) || null;
  if (correspondingEntry) {
    return correspondingEntry;
  }

  const fuzzyMatch = fuzzySearch(entriesFuse, transformedGuess, normalizedGuess);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  const correspondingAlias = aliasHashMap.get(normalizedGuess) || null;
  if (correspondingAlias) {
    const entry = entryById.get(correspondingAlias.entryId) || null;
    if (entry) {
      return entry;
    }
  }

  const aliasFuzzyMatch = fuzzySearch(aliasesFuse, transformedGuess, normalizedGuess);
  if (aliasFuzzyMatch) {
    const entry = entryById.get(aliasFuzzyMatch.entryId) || null;
    if (entry) {
      return entry;
    }
  }

  if (isDynamic) {
    const verifiedEntry = await checkAndInsertDynamic(
      aliasHashMap,
      entryByNorm,
      entryByUrl,
      transformedGuess,
      category
    );
    if (!verifiedEntry) {
      return null;
    }
    return verifiedEntry;
  }

  return null;
}

export default function GuessInput({
  aliases,
  category,
  disabled,
  entries,
  isDynamic,
  isGameCompleted,
  onCorrectGuess,
  onIncorrectGuess,
}: GuessInputProps) {
  const entryByNorm = useMemo(() => new Map<string, EntryType>(), []);
  const entryByUrl = useMemo(() => new Map<string, EntryType>(), []);
  const aliasHashMap = useMemo(() => new Map<string, AliasType>(), []);

  const entryById = useMemo(() => {
    return new Map(entries.map((e) => [e.id, e]));
  }, [entries]);

  const entriesFuse = useMemo(() => {
    return new Fuse(entries, {
      keys: ["label", "norm"],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    });
  }, [entries]);

  const aliasesFuse = useMemo(() => {
    return new Fuse(aliases, {
      keys: ["label", "norm"],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    });
  }, [aliases]);

  const [inputValue, setInputValue] = useState("");
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [showErrorEffect, setShowErrorEffect] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerCorrectEffect = () => {
    setShowCorrectEffect(true);
    setTimeout(() => setShowCorrectEffect(false), 400);
  };

  const triggerErrorEffect = () => {
    setShowErrorEffect(true);
    setTimeout(() => setShowErrorEffect(false), 400);
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!inputValue.trim()) {
        return;
      }

      setLoading(true);
      const correctEntry = await checkGuess(
        category,
        inputValue,
        aliasHashMap,
        entryByNorm,
        entryByUrl,
        entriesFuse,
        aliasesFuse,
        entryById,
        true
      );

      if (correctEntry) {
        console.log("Correct Entry! :", correctEntry);
        onCorrectGuess(correctEntry);
        setInputValue("");
        triggerCorrectEffect();
      } else {
        console.log("Incorrect Entry: ", inputValue);
        onIncorrectGuess(inputValue.trim());
        setInputValue("");
        triggerErrorEffect();
      }
      setLoading(false);
    },
    [
      inputValue,
      category,
      onCorrectGuess,
      onIncorrectGuess,
      entryByNorm,
      entryByUrl,
      aliasHashMap,
      entriesFuse,
      aliasesFuse,
      entryById,
    ]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="guess-input-container">
      <div className="spinner-wrapper">
        {loading && <div className="spinner"></div>}
      </div>
      <input
        readOnly={loading}
        disabled={isGameCompleted || disabled}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your guess..."
        className={`guess-input ${showErrorEffect ? "error-fade" : ""} ${
          showCorrectEffect ? "correct-fade" : ""
        }`}
      />
    </div>
  );
}
