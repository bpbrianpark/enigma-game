import "./dialog.css";

import React, { useState, useEffect } from "react";
import { Copy, Check, X } from "lucide-react";
import { CompletedDialogPropsType } from "./types";

export default function CompletedDialog({
    isOpen,
    onClose,
    finalTime,
    correctGuesses,
    targetEntries,
    categoryName,
    difficultyName,
    isLoggedIn,
    gameType
}: CompletedDialogPropsType) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
  };

  const generateScoreText = () => {
    const timeStr = finalTime ? formatTime(finalTime) : "N/A";
    const normalScoreText = `It took me ${timeStr} to name ${correctGuesses} of ${categoryName}!

Game Mode: ${gameType}

Think you can beat my score? Try it yourself at https://quiz-game-lime.vercel.app`;

const blitzScoreText = `I can name ${correctGuesses} of ${categoryName} in ${timeStr}!

Game Mode: ${gameType}

Think you can beat my score? Try it yourself at https://quiz-game-lime.vercel.app`;

if (gameType === "Normal") {
  return normalScoreText
} else {
  return blitzScoreText
}
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateScoreText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const createConfetti = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    const confettiPieces = [];

    for (let i = 0; i < 50; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 2;
      const startX = Math.random() * 100;

      confettiPieces.push(
        <div
          key={i}
          className="confetti-piece"
          style={{
            backgroundColor: color,
            left: `${startX}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    }
    return confettiPieces;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose}>
        {showConfetti && (
          <div className="confetti-container">{createConfetti()}</div>
        )}
        <div className="completed-dialog" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="congrats-title">🎉 Congratulations! 🎉</div>

          <div className="score-details">
            <div className="score-item">
              <span className="score-label">Score:</span>
              <span className="score-value">
                {(gameType === "Normal") ? 
                  `${correctGuesses}/${targetEntries}` :
                  correctGuesses}
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Time:</span>
              <span className="score-value">
                {finalTime ? formatTime(finalTime) : "N/A"}
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">Category:</span>
              <span className="score-value">{categoryName}</span>
            </div>
          </div>

          <button
            className={`copy-button ${copied ? "copied" : ""}`}
            onClick={copyToClipboard}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied!" : "Share Your Score"}
          </button>

          {!isLoggedIn && (
            <div className="login-message">
              💡 Register an account to save your scores to the leaderboard!
            </div>
          )}
        </div>
      </div>
    </>
  );
};
