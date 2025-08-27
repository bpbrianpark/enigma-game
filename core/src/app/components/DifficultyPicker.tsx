'use client'

import { Difficulty } from '@prisma/client';

interface DifficultyPickerProps {
  difficulties: Difficulty[];
  selectedDifficulty: Difficulty | null;
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
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
            <div className="difficulty-label">
                <span className="difficulty-text">Difficulty:</span>
            </div>
        
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
                        <span className="difficulty-level">Level {difficulty.level}</span>
                        <span className="difficulty-limit">({difficulty.limit} items)</span>
                    </button>
                ))}
            </div>
        </div>
    );
}