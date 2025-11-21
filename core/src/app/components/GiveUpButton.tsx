import "./button.css";
import { Flag } from "lucide-react";

interface GuessInputProps {
  onGiveUp: () => void;
  disabled?: boolean;
}

export default function GiveUpButton({ onGiveUp, disabled = false }: GuessInputProps) {

  const handleSubmit = () => {
    if (disabled) return;
    onGiveUp();
  }


  return (
    <button 
      onClick={handleSubmit}
      disabled={disabled}
      className="control-button control-button-destructive"
    >
      <Flag className="control-button-icon" />
      Give Up
    </button>
  );
}