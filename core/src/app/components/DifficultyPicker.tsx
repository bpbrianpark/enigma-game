'use client'

import './difficulty-picker.css'
import { DifficultyPickerProps } from './types';

function getDifficultyLabel(level: number): string {
  switch (level) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    case 4:
        return 'Extreme';
    default:
      return `Level ${level}`;
  }
}

export default function DifficultyPicker({ 
    difficulties, 
    selectedDifficulty, 
    onDifficultyChange,
    disabled = false 
}: DifficultyPickerProps) {
    const sortedDifficulties = [...difficulties].sort((a, b) => a.level - b.level);

    return (
        <div className="difficulty-picker">
        
            <div className="difficulty-options">
                {sortedDifficulties.map((difficulty) => (
                    <button
                    key={difficulty.id}
                    onClick={() => onDifficultyChange(difficulty)}
                    disabled={disabled}
                    className={`
                    difficulty-option
                    ${selectedDifficulty?.id === difficulty.id 
                        ? 'selected' 
                        : 'unselected'
                    }
                    ${disabled ? 'disabled' : ''}
                    `}
                    >
                        <span className="difficulty-level">{getDifficultyLabel(difficulty.level)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}