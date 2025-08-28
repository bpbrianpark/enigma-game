'use client'

import { useCallback, useMemo, useState } from 'react';
import { Entry } from '@prisma/client';

interface GuessInputProps {
  entries: Entry[];
  onCorrectGuess: (entry: Entry) => void;
  onIncorrectGuess: (guess: string) => void;
}

function normalizeGuess(guess: string): string {
    return guess.toLowerCase().trim().replace(/\s+/g, '');
}

function buildEntryHashMap(entries: Entry[]): Map<string, Entry> {
    const hashMap = new Map<string, Entry>();

    for (const entry of entries) {
        if (entry.norm) {
            hashMap.set(entry.norm, entry);
        }
        hashMap.set(normalizeGuess(entry.label), entry);
    }
    return hashMap;
}

function checkGuess(guess: string, entryHashMap: Map<string, Entry>): Entry | null {
    const normalizedGuess = normalizeGuess(guess);
    return entryHashMap.get(normalizedGuess) || null;
}

export default function GuessInput({ entries, onCorrectGuess, onIncorrectGuess }: GuessInputProps) {
  const entryHashMap = useMemo(() => {
        return buildEntryHashMap(entries);
    }, [entries]);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback((e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!inputValue.trim()) {
            return;
        }
        
        const correctEntry = checkGuess(inputValue, entryHashMap);

        if (correctEntry) {
            onCorrectGuess(correctEntry);
            setInputValue('');
        } else {
            onIncorrectGuess(inputValue.trim());
            setInputValue('');
        }
    }, [inputValue, entryHashMap, onCorrectGuess, onIncorrectGuess]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="guess-input-wrapper">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your guess..."
        className="guess-input"
      />
      <button 
        onClick={handleSubmit}
        className="guess-button"
      >
        Guess
      </button>
    </div>
  );
}