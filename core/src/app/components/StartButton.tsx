import './button.css'

interface StartButtonProps {
  onStart: () => void;
  disabled?: boolean;
}

export default function StartButton({ onStart, disabled = false }: StartButtonProps) {
  const handleSubmit = () => {
    if (disabled) return;
    onStart();
  }

  return (
    <button 
      onClick={handleSubmit}
      disabled={disabled}
      className="control-button control-button-secondary"
    >
      Start
    </button>
  );
}