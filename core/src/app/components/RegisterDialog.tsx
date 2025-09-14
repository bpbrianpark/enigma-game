import Link from "next/link";
import "./register-dialog.css";
import { useState } from 'react';

interface RegisterDialogProps {
    onUsernameSubmit: (username: string) => void;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function RegisterDialog({ onUsernameSubmit }: RegisterDialogProps) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showErrorEffect, setShowErrorEffect] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setError('Username is required');
            triggerErrorEffect();
            return;
        }
        setError(null);

        try {
            const response = await fetch(`/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setError('Username is already taken. Please choose another one.');
                    triggerErrorEffect();
                } else {
                    setError('Failed to create user');
                    triggerErrorEffect();
                }
                return;
            }

            if (data.success && data.isAvailable) {
                onUsernameSubmit(username.trim());
            } else {
                setError('Username is already taken. Please choose another one.');
                triggerErrorEffect();
            }
        } catch {
            setError('Network error. Please try again.');
            triggerErrorEffect();
        } 
    };

    const triggerErrorEffect = () => {
        setShowErrorEffect(true);
        setTimeout(() => setShowErrorEffect(false), 400); 
    };

    return (
        <div className="register-overlay">
        <div className="register-dialog">
            <form onSubmit={handleSubmit}>
                <Link href="/" className="exit-icon-container">
                        <img src="/xcircle.svg" alt="Exit Icon" className="exit-icon" />
                    </Link>
                <span className="enter-username-text">Enter Username</span>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    className={`register-input ${showErrorEffect ? 'error-fade' : ''}`}
                    autoFocus
                />
                <p className={`input-error ${!error ? 'empty' : ''}`}>
                    {error ?? 'placeholder'}
                </p>
            </form>
        </div>
        </div>
    );
}
