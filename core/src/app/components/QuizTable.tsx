'use client'

import { Entry } from '@prisma/client';

interface QuizTableProps {
  correctGuesses: Entry[];
  incorrectGuesses: string[];
}

export default function QuizTable({ correctGuesses, incorrectGuesses }: QuizTableProps) {

  return (
    <div className="quiz-table">
      <div className="correct-guesses-column">
        <h3 className="correct-guesses-header">
            Correct Guesses ({correctGuesses.length})
        </h3>
        <div className="correct-guesses">
            {correctGuesses.length === 0 ? (
            <p className="placeholder">No correct guesses yet...</p>
            ) : (
            <div className="guess-list">
                {correctGuesses.map((guess, index) => (
                <div 
                    key={`correct-${guess.id}-${index}`} 
                    className="correct-guess"
                >
                    <span className="correct-guess-text">{guess.label}</span>
                </div>
                ))}
            </div>
            )}
        </div>

        <div className="incorrect-guesses">
          <h3 className="incorrect-guesses-header">
            Incorrect Guesses ({incorrectGuesses.length})
          </h3>
          <div className="incorrect-guesses">
            {incorrectGuesses.length === 0 ? (
              <p className="incorrect-placeholder">No incorrect guesses yet...</p>
            ) : (
              <div className="incorrect-guess-list">
                {incorrectGuesses.map((guess, index) => (
                  <div 
                    key={`incorrect-${index}-${guess}`} 
                    className="incorrect-guess"
                  >
                    <span className="incorrect-guess-text">{guess}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}