"use client";

import "./guess-input.css";
import Fuse from "fuse.js";

import { useCallback, useMemo, useRef, useState } from "react";
import { queryWDQS } from "../../../lib/wdqs";
import { normalize } from "../../../lib/normalize";
import { AliasType, CategoryType, EntryType, GuessInputProps } from "./types";

const FUZZY_THRESHOLD = 0.1;
const LENGTH_DIFF_THRESHOLD = 3;

function buildEntryMaps(entries: EntryType[]) {
  const entryByNorm = new Map<string, EntryType>();
  const entryByUrl = new Map<string, EntryType>();

  for (const entry of entries) {
    if (entry.norm) entryByNorm.set(entry.norm, entry);
    entryByNorm.set(normalize(entry.label), entry);

   if (entry.url) entryByUrl.set(entry.url, entry);
  }

  return { entryByNorm, entryByUrl };
}

function buildAliasHashMap(aliases: AliasType[]): Map<string, AliasType> {
  const hashMap = new Map<string, AliasType>();

  for (const alias of aliases) {
    if (alias.norm) {
      hashMap.set(alias.norm, alias);
    }

    hashMap.set(normalize(alias.label), alias);
  }

  return hashMap;
}

function buildCategoryQuery(updateSparql: string, guess: string): string {
  return updateSparql.replace("SEARCH_TERM", `${guess}`);
}

async function insertAlias(
  alias: string,
  guess: string,
  normalizedGuess: string,
  category: CategoryType,
  aliasHashMap: Map<string, AliasType>,
  entry: EntryType
): Promise<EntryType | null> {
  if (normalize(alias) != normalizedGuess) {
    return null
  }
  try {
    const res = await fetch(`/api/categories/${category.slug}/aliases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: category.id,
        entryId: entry.id,
        label: guess,
        norm: normalizedGuess,
      }),
    });

    if (res.ok) {
      const alias: AliasType = await res.json();
      if (alias.norm) aliasHashMap.set(alias.norm, alias);
      return entry;
    }
  } catch (e) {
    console.error("Failed to insert alias", e);
  }
  return null;
}

async function insertNewEntry(
  category: CategoryType,
  label: string,
  normalizedLabel: string,
  url: string,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>
): Promise<EntryType | null> {
  try {
    const res = await fetch(`/api/categories/${category.slug}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: category.id,
        label,
        norm: normalizedLabel,
        url,
      }),
    });

    if (res.ok) {
      const entry: EntryType = await res.json();
      if (entry.norm) entryByNorm.set(entry.norm, entry);
      entryByNorm.set(normalize(entry.label), entry);
      if (entry.url) entryByUrl.set(entry.url, entry);
      return entry;
    }
  } catch (err) {
    console.error("Failed to insert entry via API:", err);
  }
  return null;
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
  // If alias doesn't exist, only check if label is within threshold
  let normalizedAlias;
  if (alias) { 
    normalizedAlias = normalize(alias);
    
    if ((Math.abs(normalizedLabel.length - guess.length) > LENGTH_DIFF_THRESHOLD)
   && (Math.abs(normalizedAlias.length - guess.length) > LENGTH_DIFF_THRESHOLD)) {
    return null;
  }
  } else {
    if ((Math.abs(normalizedLabel.length - guess.length) > LENGTH_DIFF_THRESHOLD)) {
      return null;
    }
  }

  // Insert alias if the entry already exists in the DB
  if (entryByUrl.has(url)) {
    return await insertAlias(
      alias,
      guess,
      normalizedGuess,
      category,
      aliasHashMap,
      entryByUrl.get(url)!
    );
  }

  // Return null if the entry's alias doesn't match the given alias
  return await insertNewEntry(category, label, normalizedLabel, url, entryByNorm, entryByUrl);
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
  console.log("Bindings: ", data.results.bindings)
  for (const binding of data.results.bindings) {
    const entry = await handleBinding(
      binding,
      guess,
      normalizedGuess,
      category,
      aliasHashMap,
      entryByNorm,
      entryByUrl
    );
    if (entry) return entry;
  }

  return null;
}


function fuzzySearch(entries: EntryType[], guess: string): EntryType | null {
  const fuse = new Fuse(entries, {
    keys: ["label", "norm"],
    threshold: FUZZY_THRESHOLD,
    includeScore: true,
  });

  const results = fuse.search(guess);

  if (
    results.length > 0 &&
    results[0].score &&
    results[0].score < FUZZY_THRESHOLD &&
    Math.abs(results[0].item.norm.length - guess.length) <=
      LENGTH_DIFF_THRESHOLD
  ) {
    return results[0].item;
  }

  return null;
}

function fuzzySearchAlias(aliases: AliasType[], guess: string): AliasType | null {
  const fuse = new Fuse(aliases, {
    keys: ["label", "norm"],
    threshold: FUZZY_THRESHOLD,
    includeScore: true,
  });

  const results = fuse.search(guess);

  if (
    results.length > 0 &&
    results[0].score &&
    results[0].score < FUZZY_THRESHOLD &&
    Math.abs(results[0].item.norm.length - guess.length) <=
      LENGTH_DIFF_THRESHOLD
  ) {
    return results[0].item;
  }

  return null;
}

async function checkGuess(
  category: CategoryType,
  guess: string,
  aliases: AliasType[],
  aliasHashMap: Map<string, AliasType>,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>,
  entries: EntryType[],
  isDynamic: boolean
): Promise<EntryType | null> {
  const normalizedGuess = normalize(guess);

  const correspondingEntry = entryByNorm.get(normalizedGuess) || null;
  if (correspondingEntry) {
    return correspondingEntry;
  }

  const fuzzyMatch = fuzzySearch(entries, guess);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

const correspondingAlias = aliasHashMap.get(normalizedGuess) || null;
if (correspondingAlias) {
  const entry = entries.find((e) => e.id === correspondingAlias.entryId) || null;
  if (entry) {
    return entry;
  }
}

const aliasFuzzyMatch = fuzzySearchAlias(aliases, guess);
if (aliasFuzzyMatch) {
  const entry = entries.find((e) => e.id === aliasFuzzyMatch.entryId) || null;
  if (entry) {
    return entry;
  }
}

  if (isDynamic) {
    const verifiedEntry = await checkAndInsertDynamic(
      aliasHashMap,
      entryByNorm,
      entryByUrl,
      guess,
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
  const { entryByNorm, entryByUrl } = useMemo(() => {
  return buildEntryMaps(entries);
}, [entries]);

  const aliasHashMap = useMemo(() => {
    return buildAliasHashMap(aliases);
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
        aliases,
        aliasHashMap,
        entryByNorm,
        entryByUrl,
        entries,
        isDynamic
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
      entryByNorm,
      entryByUrl,
      entries,
      category,
      isDynamic,
      onCorrectGuess,
      onIncorrectGuess,
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
