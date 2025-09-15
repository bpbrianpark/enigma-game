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

  return (
    <nav className="navbar">
      <Link href="/">
        <img src="/home.svg" alt="Home" className="home-icon" />
      </Link>

      {currentSession?.user ? (
        <div>
          <span className="navbar-username"> {currentSession.user.username} </span>
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
    </nav>
  );
}