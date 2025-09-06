'use client'

import './guess-input.css'

import { useCallback, useMemo, useState } from 'react';
import { Category, Entry } from '@prisma/client';
import { queryWDQS } from '../../../lib/wdqs';
import { normalize } from '../../../lib/normalize';

interface GuessInputProps {
  category: Category;
  entries: Entry[];
  isDynamic: boolean;
  isGameCompleted: boolean;
  onCorrectGuess: (entry: Entry) => void;
  onIncorrectGuess: (guess: string) => void;
}

function buildEntryHashMap(entries: Entry[]): Map<string, Entry> {
    const hashMap = new Map<string, Entry>();

    for (const entry of entries) {
        if (entry.norm) {
            hashMap.set(entry.norm, entry);
        }
        hashMap.set(normalize(entry.label), entry);
    }
    return hashMap;
}

function buildCategoryQuery(updateSparql: string, guess: string): string {
  return updateSparql.replace("SEARCH_TERM", `${guess}`);
}

async function checkAndInsertDynamic(
  entryHashMap: Map<string, Entry>,
  guess: string,
  category: Category
): Promise<Entry | null> {
  if (!category.updateSparql) {
    return null;
  }

  const sparqlWithGuess = buildCategoryQuery(category.updateSparql, guess);

  const data = await queryWDQS(sparqlWithGuess);

  if (data.results.bindings.length === 0) {
    return null;
  }

  const first = data.results.bindings[0];
  if (!first) return null;

  const label = first.itemLabel?.value ?? first.item_label?.value;
  const url = first.item?.value;
  if (!label || !url) return null;

  try {
    const res = await fetch(`/api/categories/${category.slug}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: category.id,
        label,
        norm: normalize(label),
        url,
      }),
    });
    if (res.ok) {
      const entry: Entry = await res.json();
      if (entry.norm) entryHashMap.set(entry.norm, entry);
      entryHashMap.set(normalize(entry.label), entry);
      return entry;
    }
  } catch (err) {
    console.error("Failed to insert entry via API:", err);
  }
    return null;
  }


async function checkGuess(
  category: Category,
  guess: string,
  entryHashMap: Map<string, Entry>,
  isDynamic: boolean
): Promise<Entry | null> {
  const normalizedGuess = normalize(guess);
  const correspondingEntry = entryHashMap.get(normalizedGuess) || null;
  if (isDynamic && correspondingEntry === null) {
    const verifiedEntry = await checkAndInsertDynamic(entryHashMap, guess, category);
    if (!verifiedEntry) {
      return null;
    }
    return verifiedEntry
  }

  return correspondingEntry;
}


export default function GuessInput({ category, entries, isDynamic, isGameCompleted, onCorrectGuess, onIncorrectGuess }: GuessInputProps) {
  const entryHashMap = useMemo(() => {
        return buildEntryHashMap(entries);
    }, [entries]);
  const [inputValue, setInputValue] = useState('');
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


  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!inputValue.trim()) {
            return;
        }
        
        const correctEntry = await checkGuess(category, inputValue, entryHashMap, isDynamic);

        if (correctEntry) {
            console.log("Correct Entry! :", correctEntry)
            onCorrectGuess(correctEntry);
            setInputValue('');
            triggerCorrectEffect();
        } else {
            console.log("Incorrect Entry: ", inputValue)
            onIncorrectGuess(inputValue.trim());
            setInputValue('');
            triggerErrorEffect();
        }

    }, [inputValue, entryHashMap, onCorrectGuess, onIncorrectGuess]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
        className={`guess-input ${showErrorEffect ? 'error-fade' : ''} ${showCorrectEffect ? 'correct-fade' : ''}`}
      />
  );
}