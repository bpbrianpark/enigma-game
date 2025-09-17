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
    <div className="start-wrapper">
      <button 
        onClick={handleSubmit}
        disabled={disabled}
        className="start-button"
      >
        Start
      </button>
    </div>
  );
}