'use client'

import "./button.css";

import { useCallback, useMemo, useState } from 'react';

interface GuessInputProps {
  onGiveUp: () => void;
  disabled?: boolean;
}

export default function GiveUpButton({ onGiveUp, disabled = false }: GuessInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (disabled) return;
    onGiveUp();
  }


  return (
    <div className="give-up-wrapper">
      <button 
        onClick={handleSubmit}
        disabled={disabled}
        className="give-up-button"
      >
        Give Up
      </button>
    </div>
  );
}