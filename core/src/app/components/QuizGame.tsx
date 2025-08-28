'use client'

import { useState, useCallback, useMemo } from 'react';
import GuessInput from './GuessInput';
import QuizTable from './QuizTable';
import Stopwatch from './Stopwatch';
import { Difficulty, Entry } from '@prisma/client';
import DifficultyPicker from './DifficultyPicker';
import GiveUpButton from './GiveUpButton';
import RestartButton from './RestartButton';

interface QuizGameClientProps { 
    difficulties: Difficulty[]
    entries: Entry[];
    totalEntries: number; 
    slug: string;
}

export default function QuizGame({ difficulties, entries, totalEntries, slug }: QuizGameClientProps) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(
        difficulties.length > 0 ? difficulties[0] : null
    );
    const [correctGuesses, setCorrectGuesses] = useState<Entry[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
    const [finalTime, setFinalTime] = useState<number | null>(null);
    const [givenUp, setGivenUp] = useState(false);
    const [shouldReset, setShouldReset] = useState(false);

    const targetEntries = selectedDifficulty?.limit || totalEntries;

    const isTargetEntriesGuessed = useMemo(() => {
        return correctGuesses.length === targetEntries;
    }, [correctGuesses.length, targetEntries])

    const isGameCompleted = useMemo(() => {
        return (isTargetEntriesGuessed || givenUp)
    }, [isTargetEntriesGuessed, givenUp])

    const handleCorrectGuess = useCallback((guess: Entry) => {
        if (correctGuesses.includes(guess)) {
        return;
        }
        
        setCorrectGuesses(prev => [...prev, guess]);
    }, [correctGuesses]);

    const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        setGivenUp(false);
        setCorrectGuesses([]);
        setIncorrectGuesses([]);
        setFinalTime(null);
        setShouldReset(true);
    }, []);

    const handleGiveUp = useCallback(() => {
        setGivenUp(true)
    }, [])

    const handleIncorrectGuess = useCallback((guess: string) => {
        if (incorrectGuesses.includes(guess)) {
        return;
        }
        
        setIncorrectGuesses(prev => [...prev, guess]);
    }, [incorrectGuesses]);

    const handleRestart = useCallback(() => {
        setGivenUp(false);
        setCorrectGuesses([]);
        setIncorrectGuesses([]);
        setFinalTime(null);
        setShouldReset(true);
    }, []);

    const handleStopwatchReset = useCallback(() => {
        setShouldReset(false);
    }, [])

    const handleStopwatchUpdate = useCallback((time: number) => {
        if ((isTargetEntriesGuessed && finalTime === null) || givenUp) {
            setFinalTime(time);
        }
    }, [givenUp, isTargetEntriesGuessed, finalTime])

    return (
        <div className="quiz-container">
        <div className="quiz-top-layer">
            <div className="stopwatch">
            <Stopwatch 
            isRunning={!isGameCompleted}
            shouldReset={shouldReset}
            onResetComplete={handleStopwatchReset}
            onTimeUpdate={handleStopwatchUpdate}
            />
            {isTargetEntriesGuessed && (
                <div className="quiz-completed-message">
                    Quiz complete!
                </div>
            )}
            </div>
            <GiveUpButton disabled={givenUp} onGiveUp={handleGiveUp}/>
            {isGameCompleted && 
            <RestartButton onRestart={handleRestart}/>}
        </div>

        <div className="quiz-second-layer">
            <div className="category-name">
            {slug.replace('-', ' ').toUpperCase()}
            </div>

            <div className="difficulty-picker">
                <DifficultyPicker
                    difficulties={difficulties}
                    selectedDifficulty={selectedDifficulty}
                    onDifficultyChange={handleDifficultyChange}
                    disabled={isTargetEntriesGuessed}
                ></DifficultyPicker>
            <div className="text-sm text-gray-600">
                {correctGuesses.length} / {targetEntries} correct
            </div>
            </div>
        </div>

        <div className="quiz-third-layer">
            <div className="input-guesser">
            <GuessInput 
                entries={entries}
                isGameCompleted={isGameCompleted}
                onCorrectGuess={handleCorrectGuess}
                onIncorrectGuess={handleIncorrectGuess}
            />
            </div>
        </div>

        <QuizTable 
            correctGuesses={correctGuesses}
            incorrectGuesses={incorrectGuesses}
        />
        </div>
    );
    }