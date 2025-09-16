'use client';

import './sign-up-form.css'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showErrorEffect, setShowErrorEffect] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Email is required');
            triggerErrorEffect();
            return;
        }
        
        if (!password) {
            setError('Password is required');
            triggerErrorEffect();
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const signInResult = await signIn("credentials", { 
                email: email.trim(), 
                password, 
                redirect: false 
            });
            console.log(signInResult)

            if (signInResult?.ok) {
                router.push(callbackUrl);
            } else {
                setError(signInResult?.error || 'Invalid email or password');
                triggerErrorEffect();
            }

        } catch (err) {
            setError('Network error. Please try again.');
            triggerErrorEffect();
        } finally {
            setLoading(false);
        }
    };

    const triggerErrorEffect = () => {
        setShowErrorEffect(true);
        setTimeout(() => setShowErrorEffect(false), 400); 
    };

    return (
        <div className="register-overlay"> 
            <div className="sign-in-dialog">
                <form onSubmit={handleSubmit}>
                    <span className="enter-username-text">Sign In</span>
                    
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email..."
                        className={`register-input ${showErrorEffect ? 'error-fade' : ''}`}
                        autoFocus
                        disabled={loading}
                    />
                    
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password..."
                        className={`register-input ${showErrorEffect ? 'error-fade' : ''}`}
                        disabled={loading}
                    />
                    
                    <button 
                        type="submit" 
                        className={`register-submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    
                    <p className={`input-error ${!error ? 'empty' : ''}`}>
                        {'Error signing in. Please enter the correct email/password.'}
                    </p>
                    
                    <div className="auth-links">
                        <span>Don't have an account? </span>
                        <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                            Create Account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}