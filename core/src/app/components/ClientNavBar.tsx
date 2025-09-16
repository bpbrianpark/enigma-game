'use client';

import "./navbar.css";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";
import { Session } from "next-auth";
import SignInButton from "./SignInButton";

interface ClientNavBarProps {
  initialSession: Session | null;
}

export default function ClientNavBar({ initialSession }: ClientNavBarProps) {
  const { data: session } = useSession();
  
  const currentSession = session ?? initialSession;

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="home-section">
        <Link href="/">
          <img src="/home.svg" alt="Home" className="home-icon" />
          </Link></div>

          <div className="title-section">
            <h2>Knowington</h2>
          </div>
        {currentSession?.user ? (
          <div className="navbar-user-section">
            <Link href={`/profile/${currentSession.user.username}`} className="profile-link">
              <div className="navbar-profile-circle">
                {currentSession.user.image ? (
                  <img src={currentSession.user.image} alt="Profile" />
                ) : (
                  <span className="navbar-profile-initials">
                    {getUserInitials(currentSession.user.username || currentSession.user.name || 'U')}
                  </span>
                )}
              </div>
              <span className="navbar-username">
                {currentSession.user.username || currentSession.user.name}
              </span>
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
      </nav>
    </div>
  );
}