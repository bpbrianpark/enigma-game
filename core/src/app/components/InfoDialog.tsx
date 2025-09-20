import "./dialog.css";

import React, { useState, useEffect } from "react";
import { Copy, Check, X } from "lucide-react";
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
        <div className="completed-dialog" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="congrats-title">How to Play</div>

          <div className="info-details">
            <div className="info-item">
              <span className="info-label">Normal</span>
              <span className="info-value">
                See how fast you can name a certain amount of people or things from a category that have a Wikipedia page!
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Blitz</span>
              <span className="info-value">
                Name as many things or people of a certain category that have a Wikipedia page before time runs out!
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
