import './button.css'
import { RotateCcw } from 'lucide-react';

interface RestartButtonProps {
  onRestart: () => void;
  disabled?: boolean;
}

export default function RestartButton({ onRestart, disabled = false }: RestartButtonProps) {
  const handleSubmit = () => {
    if (disabled) return;
    onRestart();
  }

  return (
    <button 
      onClick={handleSubmit}
      disabled={disabled}
      className="control-button control-button-secondary"
    >
      <RotateCcw className="control-button-icon" />
      Restart
    </button>
  );
}