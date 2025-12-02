"use client";

import "./quiz-game.css";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import GuessInput from "./GuessInput";
import QuizTable from "./QuizTable";
import Stopwatch from "./Stopwatch";
import DifficultySelect from "./DifficultySelect";
import GiveUpButton from "./GiveUpButton";
import RestartButton from "./RestartButton";
import Link from "next/link";
import { DifficultyType, EntryType, QuizGameClientPropsType } from "./types";
import LeaderboardButton from "./LeaderboardButton";
import BackToCategoriesButton from "./BackToCategoriesButton";
import AuthButton from "./AuthButton";
import Timer from "./Timer";
import StartButton from "./StartButton";
import InfoDialog from "./InfoDialog";
import CompletedDialog from "./CompletedDialog";
import AdSlot from "./AdSlot";
import { CircleQuestionMark } from "lucide-react";

export default function BlitzGame({
  aliases,
  category,
  difficulties,
  entries,
  totalEntries,
  slug,
  isDynamic,
}: QuizGameClientPropsType) {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();
  const safeDifficulties = (difficulties ?? []) as DifficultyType[];
  const safeEntries = entries ?? [];
  const safeAliases = aliases ?? [];
  const safeCategory = category;
  const safeTotalEntries =
    typeof totalEntries === "number" ? totalEntries : safeEntries.length;
  const safeIsDynamic = Boolean(isDynamic);

  if (!safeCategory) {
    console.error("[BlitzGame] Missing category data; unable to render");
    return null;
  }

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyType | null>(
      safeDifficulties.length > 0 ? safeDifficulties[0] : null,
    );
  const [correctGuesses, setCorrectGuesses] = useState<EntryType[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [givenUp, setGivenUp] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFinishedIndicator, setShowFinishedIndicator] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const hasPostedRef = useRef(false);

  const targetEntries = safeTotalEntries;
  const timeLimit = 60000;

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
    [correctGuesses],
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
    [incorrectGuesses],
  );

  const handleGiveUp = useCallback(() => {
    setGivenUp(true);
    setShowFinishedIndicator(true);
  }, []);

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

      if (user) {
        const gameData = {
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
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(`/api/entries/tally`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tallyPayload),
          });

          if (response.ok) {
            break; 
          }
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          } else {
            const text = await response.text();
            console.error("[BlitzGame] Failed to tally entries after retries", {
              status: response.status,
              body: text,
            });
          }
        } catch (error) {
          if (attempt === maxRetries - 1) {
            console.error("[BlitzGame] Error posting tally payload", error);
          } else {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
        }
      }
    },
    [user, slug, selectedDifficulty, targetEntries, correctGuesses],
  );

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    if (!hasPostedRef.current) {
      hasPostedRef.current = true;
      postGameData(finalTime ?? undefined);
    }
  }, [finalTime, postGameData]);

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
    [givenUp, isTargetEntriesGuessed, finalTime, timeLimit, postGameData],
  );

  const handleCloseCongratsDialog = useCallback(() => {
    setShowFinishedIndicator(false);
  }, [showFinishedIndicator]);

  const handleOpenInfoDialog = useCallback(() => {
    setShowInfoDialog(true);
  }, []);

  const handleCloseInfoDialog = useCallback(() => {
    setShowInfoDialog(false);
  }, []);

  useEffect(() => {
    if (
      (isTargetEntriesGuessed &&
        finalTime !== null &&
        !!user &&
        selectedDifficulty) ||
      (givenUp && finalTime !== null && !!user)
    ) {
      setShowFinishedIndicator(true);
    }
  }, [isTargetEntriesGuessed, finalTime, givenUp, user, selectedDifficulty]);

  useEffect(() => {
    if (
      (isTargetEntriesGuessed &&
        finalTime !== null &&
        !!user &&
        selectedDifficulty) ||
      (givenUp && finalTime !== null && !!user) ||
      (isGameCompleted && finalTime !== null && !!user)
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
    user,
    selectedDifficulty,
    postGameData,
  ]);

  const sideAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;

  return (
    <div className="quiz-page-shell">
      <aside className="quiz-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
      <div className="quiz-center-column">
        <div className="quiz-container">
          <div className="quiz-header-section">
            <div className="quiz-header-content">
              <h1 className="game-mode-name">Blitz</h1>
            </div>
            <div className="quiz-header-row">
              <h1 className="category-name">{safeCategory.name}</h1>
              <div className="quiz-header-actions">
                <button
                  onClick={handleOpenInfoDialog}
                  className="header-button"
                >
                  <CircleQuestionMark className="header-button-icon" />
                </button>
                <LeaderboardButton slug={slug} />
                <BackToCategoriesButton />
                <AuthButton />
              </div>
            </div>
          </div>

          <div className="quiz-top-layer">
            <div className="timer-controls-wrapper">
              <div className="timer-section">
                <div className="timer-label">Time</div>
                <Timer
                  isRunning={!isGameCompleted && gameStarted}
                  shouldReset={shouldReset}
                  timeLimit={timeLimit}
                  onResetComplete={handleTimerReset}
                  onTimeUpdate={handleTimerUpdate}
                  onTimeUp={handleTimeUp}
                />
              </div>

              <div className="controls-row">
                <DifficultySelect
                  difficulties={safeDifficulties}
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={handleDifficultyChange}
                  disabled={isTargetEntriesGuessed}
                  isDaily={false}
                />

                <StartButton
                  disabled={gameStarted || isGameCompleted}
                  onStart={handleStart}
                />

                <div className="control-buttons-group">
                  <GiveUpButton
                    disabled={isGameCompleted || !gameStarted}
                    onGiveUp={handleGiveUp}
                  />
                  <RestartButton
                    disabled={!isGameCompleted}
                    onRestart={handleRestart}
                  />
                </div>
              </div>
            </div>

            {!loading && !user && (
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

                {isGameCompleted && isLoggedIn && (
                  <span className="completed-game-message">
                    Check how you did on the leaderboard!
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
                disabled={isGameCompleted || !gameStarted}
                entries={safeEntries}
                isDynamic={safeIsDynamic}
                isGameCompleted={isGameCompleted}
                onCorrectGuess={handleCorrectGuess}
                onIncorrectGuess={handleIncorrectGuess}
                correctGuesses={correctGuesses}
                incorrectGuesses={incorrectGuesses}
              />
            )}
            <div className="progress-text">
              {correctGuesses.length} / {targetEntries} correct
            </div>
          </div>

          <div className="quiz-table-wrapper">
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
            difficultyName={selectedDifficulty?.name ?? "Unknown"}
            isLoggedIn={isLoggedIn}
            gameType={"Blitz"}
          />

          <InfoDialog
            isOpen={showInfoDialog}
            onClose={handleCloseInfoDialog}
            gameType={"Blitz"}
          />
        </div>
      </div>
      <aside className="quiz-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
    </div>
  );
}
