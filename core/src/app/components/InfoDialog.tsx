import "./dialog.css";

import React, { useState, useEffect } from "react";
import { Copy, Check, X, Lightbulb, Clock, Target, Trophy } from "lucide-react";
import { InfoDialogPropsType } from "./types";

export default function InfoDialog({
    isOpen,
    onClose,
    gameType
}: InfoDialogPropsType) {

  if (!isOpen) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose}>
        <div className="info-dialog" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="info-dialog-header">
            <h2 className="info-dialog-title">How to Play</h2>
            <p className="info-dialog-subtitle">Test your knowledge and speed!</p>
          </div>

          <div className="info-dialog-content">
            <div className="info-step">
              <div className="info-step-icon">
                <Lightbulb size={24} />
              </div>
              <div className="info-step-content">
                <h3 className="info-step-title">Type Your Guesses</h3>
                <p className="info-step-description">
                  Enter names of people, places, or things that match the category and have a Wikipedia page. Correct guesses appear in green!
                </p>
              </div>
            </div>

            <div className="info-step">
              <div className="info-step-icon">
                <Clock size={24} />
              </div>
              <div className="info-step-content">
                <h3 className="info-step-title">Game Modes</h3>
                <div className="info-mode-section">
                  <div className="info-mode-card">
                    <div className="info-mode-header">
                      <span className="info-mode-badge normal">Normal</span>
                    </div>
                    <p className="info-mode-description">
                      Race against the clock to name a target number of items. Your time is recorded on the leaderboard!
                    </p>
                  </div>
                  <div className="info-mode-card">
                    <div className="info-mode-header">
                      <span className="info-mode-badge blitz">Blitz</span>
                    </div>
                    <p className="info-mode-description">
                      Name as many items as possible in 60 seconds! Speed and accuracy are key.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-dialog-footer">
            <button className="info-dialog-close-btn" onClick={onClose}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
