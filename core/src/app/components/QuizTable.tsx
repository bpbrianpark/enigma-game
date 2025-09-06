'use client'

import "./quiz-table.css";

import { Entry } from '@prisma/client';

interface QuizTableProps {
  correctGuesses: Entry[];
  incorrectGuesses: string[];
}

export default function QuizTable({ correctGuesses, incorrectGuesses }: QuizTableProps) {

  return (
    <div className="quiz-table">
      <div className="guesses-column">
          <span className="correct-guesses-header">
            Correct Guesses
        </span> 
        <div className="guesses">
            {correctGuesses.length === 0 ? (
            <p className="placeholder">No correct guesses yet...</p>
            ) : (
            <div className="guess-list">
                {correctGuesses.map((guess, index) => (
                <div 
                    key={`correct-${guess.id}-${index}`} 
                    className="correct-guess"
                >
                    <span className="correct-guess-text">{index + 1}. {guess.label}</span>
                </div>
                ))}
            </div>
            )}
        </div>
      </div>

      <div className="guesses-column">
          <span className="incorrect-guesses-header">
            Incorrect Guesses
          </span>
          <div className="guesses">
            {incorrectGuesses.length === 0 ? (
              <p className="incorrect-placeholder">No incorrect guesses yet...</p>
            ) : (
              <div className="guess-list">
                {incorrectGuesses.map((guess, index) => (
                  <div 
                    key={`incorrect-${index}-${guess}`} 
                    className="incorrect-guess"
                  >
                    <span className="incorrect-guess-text">{index + 1}. {guess}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}