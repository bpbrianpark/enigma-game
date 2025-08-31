'use client'

import { useState } from 'react';

interface RegisterDialogProps {
    onUsernameSubmit: (username: string) => void;
}

export default function RegisterDialog({ onUsernameSubmit }: RegisterDialogProps) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        setError(null);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setError('Username is already taken. Please choose another one.');
                } else {
                    setError('Failed to create user');
                }
                return;
            }

            if (data.success && data.isAvailable) {
                onUsernameSubmit(username.trim());
            } else {
                setError('Username is already taken. Please choose another one.');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } 
    };

    return (
        <div className="register-dialog">
            <form onSubmit={handleSubmit} className="register-input-">
                <div>
                    <h1>
                        Username
                    </h1>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="register-input"
                        autoFocus
                    />
                    {error && (
                        <p className="input-error">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!username.trim()}
                    className="start-button"
                >
                    {'Start'}
                </button>
            </form>
        </div>
    );
}