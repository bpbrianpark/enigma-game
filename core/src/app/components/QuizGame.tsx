'use client'

import { useState, useCallback, useMemo } from 'react';
import GuessInput from './GuessInput';
import QuizTable from './QuizTable';
import Stopwatch from './Stopwatch';
import { Difficulty, Entry } from '@prisma/client';
import DifficultyPicker from './DifficultyPicker';
import GiveUpButton from './GiveUpButton';

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
    const [completed, setCompleted] = useState(false);

    const targetEntries = selectedDifficulty?.limit || totalEntries;

    const isQuizCompleted = useMemo(() => {
        return correctGuesses.length === targetEntries;
    }, [correctGuesses.length, totalEntries])

    const handleCorrectGuess = useCallback((guess: Entry) => {
        if (correctGuesses.includes(guess)) {
        return;
        }
        
        setCorrectGuesses(prev => [...prev, guess]);
    }, [correctGuesses]);

    const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        setCorrectGuesses([]);
        setIncorrectGuesses([]);
        setFinalTime(null);
    }, []);

    const handleGiveUp = useCallback(() => {
        console.log("Hath given up.")
        setCompleted(true)
    }, [])

    const handleIncorrectGuess = useCallback((guess: string) => {
        if (incorrectGuesses.includes(guess)) {
        return;
        }
        
        setIncorrectGuesses(prev => [...prev, guess]);
    }, [incorrectGuesses]);

    const handleStopwatchUpdate = useCallback((time: number) => {
        if ((isQuizCompleted && finalTime === null) || completed) {
            setFinalTime(time);
        }
    }, [completed, isQuizCompleted, finalTime])

    return (
        <div className="quiz-container">
        <div className="quiz-top-layer">
            <div className="stopwatch">
            <Stopwatch 
            isRunning={!isQuizCompleted && !completed}
            onTimeUpdate={handleStopwatchUpdate}
            />
            {isQuizCompleted && (
                <div className="quiz-completed-message">
                    Quiz complete!
                </div>
            )}
            </div>
            <GiveUpButton onGiveUp={handleGiveUp}/>
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
                    disabled={isQuizCompleted}
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