"use client";

import { useSession } from "next-auth/react";
import "./hero-section.css";

export default function HeroSection() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Test Your Knowledge</h1>
        <p className="hero-subtitle">
          Challenge yourself with our collection of engaging quizzes. 
          {isLoggedIn 
            ? ` Welcome back, ${session?.user?.username}!` 
            : " Sign up to track your scores and compete on leaderboards."}
        </p>
        <div className="hero-cta">
          {!isLoggedIn && (
            <a href="/sign-up" className="hero-button primary">
              Get Started
            </a>
          )}
          <a href="#categories" className="hero-button secondary">
            Browse Categories
          </a>
        </div>
      </div>
    </div>
  );
}

