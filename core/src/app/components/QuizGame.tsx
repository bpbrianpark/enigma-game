"use client";

import "./quiz-game.css";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GuessInput from "./GuessInput";
import QuizTable from "./QuizTable";
import Stopwatch from "./Stopwatch";
import DifficultyPicker from "./DifficultyPicker";
import GiveUpButton from "./GiveUpButton";
import RestartButton from "./RestartButton";
import Link from "next/link";
import { DifficultyType, EntryType, QuizGameClientPropsType } from "./types";

export default function QuizGame({
  category,
  difficulties,
  entries,
  totalEntries,
  slug,
  isDynamic,
  initialSession,
}: QuizGameClientPropsType) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyType | null>(
      difficulties.length > 0 ? difficulties[0] : null
    );
  const [correctGuesses, setCorrectGuesses] = useState<EntryType[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [givenUp, setGivenUp] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

  const targetEntries = selectedDifficulty?.limit || totalEntries;
  const username = session?.user?.username;

  const isTargetEntriesGuessed = useMemo(() => {
    return correctGuesses.length === targetEntries;
  }, [correctGuesses.length, targetEntries]);

  const isGameCompleted = useMemo(() => {
    return isTargetEntriesGuessed || givenUp;
  }, [isTargetEntriesGuessed, givenUp]);

  const handleCorrectGuess = useCallback(
    (guess: EntryType) => {
      if (correctGuesses.includes(guess)) {
        return;
      }

      setCorrectGuesses((prev) => [...prev, guess]);
    },
    [correctGuesses]
  );

  const handleDifficultyChange = useCallback((difficulty: DifficultyType) => {
    setSelectedDifficulty(difficulty);
    setGivenUp(false);
    setCorrectGuesses([]);
    setIncorrectGuesses([]);
    setFinalTime(null);
    setShouldReset(true);
  }, []);

  const handleGiveUp = useCallback(() => {
    setGivenUp(true);
  }, []);

  const handleIncorrectGuess = useCallback(
    (guess: string) => {
      if (incorrectGuesses.includes(guess)) {
        return;
      }

      setIncorrectGuesses((prev) => [...prev, guess]);
    },
    [incorrectGuesses]
  );

  const handleRestart = useCallback(() => {
    setGivenUp(false);
    setCorrectGuesses([]);
    setIncorrectGuesses([]);
    setFinalTime(null);
    setShouldReset(true);
  }, []);

  const handleStopwatchReset = useCallback(() => {
    setShouldReset(false);
  }, []);

  const handleStopwatchUpdate = useCallback(
    (time: number) => {
      setFinalTime(time);
      if ((isTargetEntriesGuessed && finalTime === null) || givenUp) {
        setFinalTime(time);

        if (isTargetEntriesGuessed || givenUp) {
          console.log("P");
          postGameData(time);
        }
      }
    },
    [givenUp, isTargetEntriesGuessed, finalTime]
  );

  const postGameData = useCallback(
    async (time?: number) => {
      console.log("Posting This: ", correctGuesses.length);
      if (correctGuesses.length === 0) return;
      const gameData = {
        username,
        slug: slug,
        difficultyId: selectedDifficulty?.id,
        time: time,
        targetCount: targetEntries,
        correct_count: correctGuesses.length,
      };

      try {
        const response = await fetch(`/api/games`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gameData),
        });

        if (!response.ok) {
          console.error("Failed to save game data");
          console.error(response);
        }
      } catch (e) {
        console.log("Error posting game", e);
      }
    },
    [username, slug, selectedDifficulty, targetEntries, correctGuesses]
  );

  useEffect(() => {
    if (
      (isTargetEntriesGuessed &&
        finalTime !== null &&
        !!username &&
        selectedDifficulty) ||
      (givenUp && finalTime !== null && !!username)
    ) {
      postGameData(finalTime);
    }
  }, [
    isTargetEntriesGuessed,
    finalTime,
    givenUp,
    username,
    selectedDifficulty,
    postGameData,
  ]);

  return (
    <div className="quiz-container">
      <div className="quiz-top-layer">
        <div className="difficulty-picker-container">
          <DifficultyPicker
            difficulties={difficulties}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={handleDifficultyChange}
            disabled={isTargetEntriesGuessed}
          ></DifficultyPicker>
        </div>

        <div className="category-name">{category.name}</div>
        <Stopwatch
          isRunning={!isGameCompleted}
          shouldReset={shouldReset}
          onResetComplete={handleStopwatchReset}
          onTimeUpdate={handleStopwatchUpdate}
        />

        <div className="give-up-restart-button-container">
          <GiveUpButton disabled={isGameCompleted} onGiveUp={handleGiveUp} />

          <Link
            href={`/leaderboard/${slug}`}
            className="quiz-completed-message"
          >
            Leaderboards
          </Link>
          <RestartButton
            disabled={!isGameCompleted}
            onRestart={handleRestart}
          />
        </div>
        {status !== "loading" && !session && (
          <div
            className="not-logged-in-container"
          >
            <p className="not-logged-in-text">
              ⚠️ You are not logged in. Your score will not be recorded.{" "}
              <Link
                href="/sign-up"
                className="not-logged-in-link"
              >
                Click here to register
              </Link>
              .
            </p>
          </div>
        )}

        <div className="completed-game-message-container">
          {givenUp && (
            <span className="completed-game-message">
              ❌ You gave up. Try again! ❌
            </span>
          )}

          {isTargetEntriesGuessed && !isLoggedIn && (
            <span className="completed-game-message">
              ✅ Good job! Register to save your score to the leaderboard! ✅
            </span>
          )}

          {isTargetEntriesGuessed && isLoggedIn && (
            <span className="completed-game-message">
              ✅ Good job! Check how you did on the leaderboard! ✅
            </span>
          )}
        </div>
      </div>

      <div className="quiz-second-layer">
        {category && (
          <GuessInput
            category={category}
            entries={entries}
            isDynamic={isDynamic}
            isGameCompleted={isGameCompleted}
            onCorrectGuess={handleCorrectGuess}
            onIncorrectGuess={handleIncorrectGuess}
          />
        )}
        <div className="progress-text">
          {correctGuesses.length} / {targetEntries}
        </div>
      </div>

      <QuizTable
        correctGuesses={correctGuesses}
        incorrectGuesses={incorrectGuesses}
      />
    </div>
  );
}
