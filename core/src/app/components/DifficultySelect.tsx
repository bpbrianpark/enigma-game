import './difficulty-select.css';
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

export default function DifficultySelect({ 
    difficulties, 
    selectedDifficulty, 
    onDifficultyChange,
    disabled = false,
    isDaily = false
}: DifficultyPickerProps) {
    const sortedDifficulties = [...difficulties].sort((a, b) => a.level - b.level);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const difficulty = sortedDifficulties.find(d => d.id === selectedId);
        if (difficulty) {
            onDifficultyChange(difficulty);
        }
    };

    return (
        <div className={`difficulty-select-wrapper ${isDaily ? 'difficulty-select-hidden' : ''}`}>
            <div className="difficulty-select-label">Difficulty</div>
            <select
                value={selectedDifficulty?.id || ''}
                onChange={handleChange}
                disabled={disabled || isDaily}
                className="difficulty-select"
            >
                {sortedDifficulties.map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>
                        {getDifficultyLabel(difficulty.level)}
                    </option>
                ))}
            </select>
        </div>
    );
}

