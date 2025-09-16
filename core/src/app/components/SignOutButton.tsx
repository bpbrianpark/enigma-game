'use client';

import './button.css'
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    
    <button onClick={handleSignOut} className="signout-button">
      Sign Out
    </button>
  );
}