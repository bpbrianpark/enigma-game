"use client";

import "./sign-up-form.css";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorEffect, setShowErrorEffect] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      triggerErrorEffect();
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      triggerErrorEffect();
      return;
    }

    if (!password) {
      setError("Password is required");
      triggerErrorEffect();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      triggerErrorEffect();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        triggerErrorEffect();
        setLoading(false);
        return;
      }
      console.log("User created:", data.user);

      const signInResult = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push(callbackUrl);
      } else {
      setError(
          "Registration successful, but auto sign-in failed. Please sign in manually."
        );
        triggerErrorEffect();
      }
    } catch (err) {
      setError("Network error. Please try again.");
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
      <div className="register-dialog">
        <form onSubmit={handleSubmit}>
          <span className="enter-username-text">Create Account</span>

          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className={`register-input ${showErrorEffect ? "error-fade" : ""}`}
            autoFocus
            disabled={loading}
          />

          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username..."
            className={`register-input ${showErrorEffect ? "error-fade" : ""}`}
            disabled={loading}
          />

          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password..."
            className={`register-input ${showErrorEffect ? "error-fade" : ""}`}
            disabled={loading}
          />

          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password..."
            className={`register-input ${showErrorEffect ? "error-fade" : ""}`}
            disabled={loading}
          />

          <button
            type="submit"
            className={`register-submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className={`input-error ${!error ? "empty" : ""}`}>
            {error ?? "placeholder"}
          </p>

          <div className="auth-links">
            <span>Already have an account? </span>
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
  );
}
