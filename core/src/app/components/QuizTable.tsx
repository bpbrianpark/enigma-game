import Link from "next/link";
import "./quiz-table.css";
import { QuizTablePropsType } from "./types";

export default function QuizTable({
  correctGuesses,
  incorrectGuesses,
}: QuizTablePropsType) {
  return (
    <div className="quiz-table-grid">
      <div className="guess-card">
        <h2 className="guess-card-title guess-card-title-correct">
          Correct Answers
        </h2>
        <div className="guess-card-content">
          {correctGuesses.length === 0 ? (
            <div className="guess-empty-state">No correct answers yet</div>
          ) : (
            <div className="guess-list">
              {[...correctGuesses].reverse().map((guess, index) => (
                <div
                  key={`correct-${guess.id}-${index}`}
                  className="guess-item correct-guess-item"
                >
                  <Link
                    href={guess.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guess-link"
                  >
                    {correctGuesses.length - index}. {guess.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="guess-card">
        <h2 className="guess-card-title guess-card-title-incorrect">
          Incorrect Answers
        </h2>
        <div className="guess-card-content">
          {incorrectGuesses.length === 0 ? (
            <div className="guess-empty-state">No incorrect answers yet</div>
          ) : (
            <div className="guess-list">
              {[...incorrectGuesses].reverse().map((guess, index) => (
                <div
                  key={`incorrect-${index}-${guess}`}
                  className="guess-item incorrect-guess-item"
                >
                  {incorrectGuesses.length - index}. {guess}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
