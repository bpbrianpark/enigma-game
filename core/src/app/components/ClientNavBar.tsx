'use client';

import "./navbar.css";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";
import { Session } from "next-auth";
import SignInButton from "./SignInButton";
import InfoDialog from "./InfoDialog";
import { useCallback, useState } from "react";
import { CircleQuestionMark } from "lucide-react";

interface ClientNavBarProps {
  initialSession: Session | null;
}

export default function ClientNavBar({ initialSession }: ClientNavBarProps) {
  const { data: session } = useSession();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const currentSession = session ?? initialSession;

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClickInfoButton = useCallback(() => {
    setShowInfoDialog(true);
  }, [showInfoDialog])

  const handleCloseInfoDialog = useCallback(() => {
    setShowInfoDialog(false);
  }, [showInfoDialog])

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="home-section">
          <Link href="/" className="home-icon-link">
            <img src="/igloologoonly.png" alt="Home" className="home-icon" />
          </Link>
          <div className="info-button-mobile" onClick={handleClickInfoButton}>
            <CircleQuestionMark size={24}/>
          </div>
        </div>
          <div className="title-section">
            <Link href="/">
              <img src="/fullnamelogo.png" alt="Bungalow" className="navbar-logo" />
            </Link>
          </div>
          <div className="right-side-buttons">
            <div className="info-button-desktop" onClick={handleClickInfoButton}>
              <CircleQuestionMark size={24}/>
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
        </div>
      </nav>

      <InfoDialog
        isOpen={showInfoDialog}
        onClose={handleCloseInfoDialog}
      />
    </div>
  );
}