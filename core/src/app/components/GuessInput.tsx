"use client";

import "./guess-input.css";
import Fuse from "fuse.js";

import { useCallback, useMemo, useState } from "react";
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

async function checkAndInsertDynamic(
  aliasHashMap: Map<string, AliasType>,
  entryByNorm: Map<string, EntryType>,
  entryByUrl: Map<string, EntryType>,
  guess: string,
  category: CategoryType
): Promise<EntryType | null> {
  if (!category.updateSparql) {
    return null;
  }

  const sparqlWithGuess = buildCategoryQuery(category.updateSparql, guess);

  const data = await queryWDQS(sparqlWithGuess);

  if (data.results.bindings.length === 0) {
    return null;
  }

  let base_title_url;
  let result_entry = null;
  
  // store the base title url. if there's a match, set that to be the base title url
  // as you go through the list, check if the binding's url matches that of the base title url. if it does, add it to the alias list (it needs to link to the entry that was added earlier... needs to store something perhaps?)
  // if the first result doesn't match the length requirements, perhaps ignore it. should be a flag to see if its null atm or smt
  // if there IS A result, use the guess as an alias?


  // ok so basically
  // if there's a result that already exists in the list of entries... add your guess to the list of aliases

  console.log("Bindings: ", data.results.bindings)
  for (const binding of data.results.bindings) {
    const label = binding.itemLabel?.value ?? binding.item_label?.value;
    const url = binding.item?.value;

    if (!label || !url) return null;

    const normalizedLabel = normalize(label);
    const normalizedGuess = normalize(guess);

    console.log("Now we checking: ", normalizedLabel)
    console.log("Base Title URL: ", base_title_url)
    console.log("URL: ", url)
    console.log("Result Entry: ", result_entry)

    if (entryByUrl.has(url) && entryByUrl.get(url)) {
      const aliasEntry = entryByUrl.get(url)
      if (!aliasEntry) return null
      console.log("it has the alias url man")
      try {
        console.log("We're inputting: ", guess, normalizedGuess)
        const res = await fetch(`/api/categories/${category.slug}/aliases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({
            categoryId: category.id,
            entryId: aliasEntry.id,
            label: guess,
            norm: normalizedGuess,
          }),
        });

        if (res.ok) {
          const alias: AliasType = await res.json();
          if (alias.norm) aliasHashMap.set(alias.norm, alias);
          return aliasEntry
        }
      } catch (e) {
        console.error("Failed to insert alias", e)
      }
    }

    if (
      Math.abs(normalizedLabel.length - guess.length) > LENGTH_DIFF_THRESHOLD
    ) {
      continue;
    }


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
        result_entry = entry
        base_title_url = url
        return entry;
      }
    } catch (err) {
      console.error("Failed to insert entry via API:", err);
    }
  }
  return null
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

  // TODO:
  // check if exists in hashmap of alias
  const correspondingAlias = aliasHashMap.get(normalizedGuess) || null;
  if (correspondingAlias) {
    // return the entry that corresponds to that Alias
    // correspondingAlias.entryId (find or something)
  }

  // check if exists in fuzzymatch of alias
  const aliasFuzzyMatch = fuzzySearchAlias(aliases, guess);
  if (aliasFuzzyMatch) {
    // return the entry that corresponds to that Alias
    // aliasFuzzyMatch.entryId (find or something)
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
    <input
      disabled={isGameCompleted}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyPress}
      placeholder="Enter your guess..."
      className={`guess-input ${showErrorEffect ? "error-fade" : ""} ${
        showCorrectEffect ? "correct-fade" : ""
      }`}
    />
  );
}
