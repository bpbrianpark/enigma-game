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
import CompletedDialog from "./CompletedDialog";
import StartButton from "./StartButton";

function resolveDifficultyName(difficulty?: DifficultyType | null): string {
  if (!difficulty) {
    return "Unknown";
  }

  if (difficulty.name) {
    return difficulty.name;
  }

  switch (difficulty.level) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    case 4:
      return "Extreme";
    default:
      return `Level ${difficulty.level}`;
  }
}

export default function QuizGame({
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
  const safeDifficulties = (difficulties ?? []) as DifficultyType[];
  const safeEntries = entries ?? [];
  const safeAliases = aliases ?? [];
  const safeCategory = category;
  const safeTotalEntries =
    typeof totalEntries === "number" ? totalEntries : safeEntries.length;
  const safeIsDynamic = Boolean(isDynamic);

  if (!safeCategory) {
    console.error("[QuizGame] Missing category data; unable to render");
    return null;
  }

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyType | null>(
      safeDifficulties.length > 0 ? safeDifficulties[0] : null
    );
  const [correctGuesses, setCorrectGuesses] = useState<EntryType[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [givenUp, setGivenUp] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [showFinishedIndicator, setShowFinishedIndicator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const hasPostedRef = useRef(false);

  const targetEntries = selectedDifficulty?.limit || safeTotalEntries;
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
    setShowFinishedIndicator(true);
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
    hasPostedRef.current = false;
    setGivenUp(false);
    setShowFinishedIndicator(false);
    setCorrectGuesses([]);
    setIncorrectGuesses([]);
    setFinalTime(null);
    setShouldReset(true);
    setGameStarted(false);
  }, []);

  const handleStopwatchReset = useCallback(() => {
    setShouldReset(false);
  }, []);

  const handleCloseCongratsDialog = useCallback(() => {
    setShowFinishedIndicator(false);
  }, [showFinishedIndicator]);

  const postGameData = useCallback(
    async (time?: number) => {
      console.log("Posting This: ", correctGuesses.length);
      if (correctGuesses.length === 0) {
        console.warn("[QuizGame] Skipping game post because there are no correct guesses", {
          slug,
          difficultyId: selectedDifficulty?.id,
          time,
          targetEntries,
          givenUp,
        });
        return;
      }

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
        };

        console.log("[QuizGame] Submitting game payload", gameData);

        try {
          const response = await fetch(`/api/games`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gameData),
          });

          if (!response.ok) {
            const text = await response.text();
            console.error("[QuizGame] Failed to save game data", {
              status: response.status,
              body: text,
            });
          }
        } catch (e) {
          console.error("[QuizGame] Error posting game", e);
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
          const text = await response.text();
          console.error("[QuizGame] Failed to tally entries", {
            status: response.status,
            body: text,
          });
        }
      } catch (error) {
        console.error("[QuizGame] Error posting tally payload", error);
      }
    },
    [username, slug, selectedDifficulty, targetEntries, correctGuesses]
  );

  const handleStopwatchUpdate = useCallback(
    (time: number) => {
      setFinalTime(time);
      if ((isTargetEntriesGuessed && finalTime === null) || givenUp) {
        setFinalTime(time);
        if (isTargetEntriesGuessed || givenUp) {
          console.log("Target Entries has been guessed.");
          setShowFinishedIndicator(true);
          console.log("Show Finished idnicator: ", showFinishedIndicator);
          if (!hasPostedRef.current) {
            hasPostedRef.current = true;
            postGameData(time);
          }
        }
      }
    },
    [givenUp, isTargetEntriesGuessed, finalTime, postGameData]
  );

  useEffect(() => {
    if (
      (isTargetEntriesGuessed && finalTime !== null && selectedDifficulty) ||
      (givenUp && finalTime !== null)
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
    selectedDifficulty,
    showFinishedIndicator,
    postGameData,
  ]);


  useEffect(() => {
  if (isTargetEntriesGuessed || givenUp) {
    setShowFinishedIndicator(true);
  }
}, [isTargetEntriesGuessed, givenUp]);

  const isDaily = safeCategory.isDaily === true;

  return (
    <div className="quiz-container">
      <div className="quiz-top-layer">
        {!isDaily && (
          <div className="difficulty-picker-container">
            <DifficultyPicker
              difficulties={safeDifficulties}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyChange}
              disabled={isTargetEntriesGuessed}
            ></DifficultyPicker>
          </div>
        )}

        <div className="category-name">{safeCategory.name}</div>
        <Stopwatch
          isRunning={!isGameCompleted && (!isDaily || gameStarted)}
          shouldReset={shouldReset}
          onResetComplete={handleStopwatchReset}
          onTimeUpdate={handleStopwatchUpdate}
        />

        <div className="give-up-restart-button-container">
          {(!isDaily || gameStarted) && (
            <GiveUpButton disabled={isGameCompleted} onGiveUp={handleGiveUp} />
          )}
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
        {isGameCompleted && (
        <div className="completed-game-message-container">
          {givenUp && (
            <span className="completed-game-message">
              You gave up. Try again!
            </span>
          )}

          {isTargetEntriesGuessed && !isLoggedIn && (
            <span className="completed-game-message">
              Good job! Register to save your score to the leaderboard!
            </span>
          )}

          {isTargetEntriesGuessed && isLoggedIn && (
            <span className="completed-game-message">
              Good job! Check how you did on the leaderboard!
            </span>
          )}
        </div>
        )}
      </div>

      <div className="quiz-second-layer">
        {category && (
          <GuessInput
            aliases={safeAliases}
            category={safeCategory}
            disabled={isGameCompleted || (isDaily && !gameStarted)}
            entries={safeEntries}
            isDynamic={safeIsDynamic}
            isGameCompleted={isGameCompleted}
            onCorrectGuess={handleCorrectGuess}
            onIncorrectGuess={handleIncorrectGuess}
          />
        )}
        <div className="progress-text">
          {correctGuesses.length} / {targetEntries}
        </div>
      </div>

      <div className="quiz-table-wrapper">
        {isDaily && !gameStarted && (
          <div className="start-screen-box">
            <div className="start-screen-content">
              <div className="start-screen-button-container">
                <StartButton disabled={false} onStart={handleStart} />
              </div>
            </div>
          </div>
        )}
        <QuizTable
          correctGuesses={correctGuesses}
          incorrectGuesses={incorrectGuesses}
        />
      </div>

      <CompletedDialog
        isOpen={showFinishedIndicator}
        onClose={handleCloseCongratsDialog}
        finalTime={finalTime ?? 0}
        correctGuesses={correctGuesses.length}
        targetEntries={targetEntries}
        categoryName={safeCategory.name}
        difficultyName={resolveDifficultyName(selectedDifficulty)}
        isLoggedIn={isLoggedIn}
        gameType={"Normal"}
      />
    </div>
  );
}
