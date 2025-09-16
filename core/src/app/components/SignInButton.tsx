'use client';

import './button.css'
import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push("/sign-in")} 
      className="signin-button"
    >
      Sign In
    </button>
  );
}