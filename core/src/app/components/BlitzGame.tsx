"use client";

import "./quiz-game.css";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import LeaderboardButton from "./LeaderboardButton";
import Timer from "./Timer";
import StartButton from "./StartButton";
import CompletedDialog from "./CompletedDialog";

export default function BlitzGame({
  aliases,
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
  const [timeUp, setTimeUp] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFinishedIndicator, setShowFinishedIndicator] = useState(false);
  const hasPostedRef = useRef(false);

  const targetEntries = totalEntries;
  const timeLimit = 60000;
  const username = session?.user?.username;

  const isTargetEntriesGuessed = useMemo(() => {
    return correctGuesses.length === targetEntries;
  }, [correctGuesses.length, targetEntries]);

  const isGameCompleted = useMemo(() => {
    return isTargetEntriesGuessed || givenUp || timeUp;
  }, [isTargetEntriesGuessed, givenUp, timeUp]);

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
    setTimeUp(false);
    setCorrectGuesses([]);
    setIncorrectGuesses([]);
    setFinalTime(null);
    setShouldReset(true);
    hasPostedRef.current = false;
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

  const handleStart = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleRestart = useCallback(() => {
    setGivenUp(false);
    setTimeUp(false);
    setCorrectGuesses([]);
    setIncorrectGuesses([]);
    setFinalTime(null);
    setShouldReset(true);
    setGameStarted(false);
    hasPostedRef.current = false;
  }, []);

  const handleTimerReset = useCallback(() => {
    setShouldReset(false);
  }, []);

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    if (!hasPostedRef.current) {
      hasPostedRef.current = true;
      postGameData(finalTime ?? undefined);
    }
  }, []);

  const handleTimerUpdate = useCallback(
    (remainingTime: number) => {
      if (
        (isTargetEntriesGuessed || givenUp || remainingTime <= 0) &&
        finalTime === null
      ) {
        const elapsedTime = timeLimit - remainingTime;
        setFinalTime(elapsedTime);
        setShowFinishedIndicator(true);
        if (!hasPostedRef.current) {
          hasPostedRef.current = true;
          postGameData(elapsedTime);
        }
      }
    },
    [givenUp, isTargetEntriesGuessed, finalTime, timeLimit, postGameData]
  );

  const handleCloseCongratsDialog = useCallback(() => {
    setShowFinishedIndicator(false);
  }, [showFinishedIndicator]);

  const postGameData = useCallback(
    async (time?: number) => {
      console.log("Posting This: ", correctGuesses.length);
      if (correctGuesses.length === 0) return;

      const tallyPayload = {
        slug,
        entries: correctGuesses.map((entry) => ({
          label: entry.label,
          norm: entry.norm,
          url: entry.url,
        })),
      };

      if (username) {
        const gameData = {
          username,
          slug: slug,
          difficultyId: selectedDifficulty?.id,
          time: time,
          targetCount: targetEntries,
          correct_count: correctGuesses.length,
          isBlitzGame: true,
        };
        console.log(gameData);

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
      }

      try {
        const response = await fetch(`/api/entries/tally`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tallyPayload),
        });

        if (!response.ok) {
          console.error("Failed to tally entries");
          console.error(response);
        }
      } catch (error) {
        console.error("Error posting tally payload", error);
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
      setShowFinishedIndicator(true);
    }
  }, [isTargetEntriesGuessed, finalTime, givenUp, username, selectedDifficulty]);

  useEffect(() => {
    if (
      (isTargetEntriesGuessed &&
        finalTime !== null &&
        !!username &&
        selectedDifficulty) ||
      (givenUp && finalTime !== null && !!username) ||
      (isGameCompleted && finalTime !== null && !!username)
    ) {
      if (!hasPostedRef.current) {
        hasPostedRef.current = true;
        postGameData(finalTime);
      }
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
        <Timer
          isRunning={!isGameCompleted && gameStarted}
          shouldReset={shouldReset}
          timeLimit={timeLimit}
          onResetComplete={handleTimerReset}
          onTimeUpdate={handleTimerUpdate}
          onTimeUp={handleTimeUp}
        />

        <div className="give-up-restart-button-container">
          <StartButton disabled={gameStarted} onStart={handleStart} />
          <LeaderboardButton slug={slug} />
          <RestartButton
            disabled={!isGameCompleted}
            onRestart={handleRestart}
          />
        </div>

        {status !== "loading" && !session && (
          <div className="not-logged-in-container">
            <p className="not-logged-in-text">
              You are not logged in. Your score will not be recorded.{" "}
              <Link href="/sign-up" className="not-logged-in-link">
                Click here to register
              </Link>
              .
            </p>
          </div>
        )}

        <div className="completed-game-message-container">
          {givenUp && (
            <span className="completed-game-message">
              You gave up. Try again!
            </span>
          )}

          {isGameCompleted && isLoggedIn && (
            <span className="completed-game-message">
              Check how you did on the leaderboard!
            </span>
          )}
        </div>
      </div>

      <div className="quiz-second-layer">
        {category && (
          <GuessInput
            aliases={aliases}
            category={category}
            disabled={!gameStarted}
            entries={entries}
            isDynamic={isDynamic}
            isGameCompleted={isGameCompleted}
            onCorrectGuess={handleCorrectGuess}
            onIncorrectGuess={handleIncorrectGuess}
          />
        )}
        <div className="progress-text">{correctGuesses.length}</div>
      </div>

      <QuizTable
        correctGuesses={correctGuesses}
        incorrectGuesses={incorrectGuesses}
      />

      <CompletedDialog
        isOpen={showFinishedIndicator}
        onClose={handleCloseCongratsDialog}
        finalTime={finalTime}
        correctGuesses={correctGuesses.length}
        targetEntries={targetEntries}
        categoryName={category.name}
        difficultyName={selectedDifficulty?.name}
        isLoggedIn={isLoggedIn}
        gameType={"Blitz"}
      />
    </div>
  );
}
