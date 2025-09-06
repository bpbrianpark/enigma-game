'use client'

import './button.css'

import { useCallback, useMemo, useState } from 'react';

interface RestartButtonProps {
  onRestart: () => void;
  disabled?: boolean;
}

export default function RestartButton({ onRestart, disabled = false }: RestartButtonProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (disabled) return;
    onRestart();
  }


  return (
    <div className="restart-wrapper">
      <button 
        onClick={handleSubmit}
        disabled={disabled}
        className="restart-button"
      >
        Restart
      </button>
    </div>
  );
}