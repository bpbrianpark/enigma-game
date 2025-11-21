"use client";

import "./button.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, LogIn } from "lucide-react";

export default function AuthButton() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = () => {
    if (session?.user?.username) {
      router.push(`/profile/${session.user.username}`);
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <button onClick={handleClick} className="header-button">
      {session?.user?.username ? (
        <>
          <User className="header-button-icon" />
          Profile
        </>
      ) : (
        <>
          <LogIn className="header-button-icon" />
          Sign In
        </>
      )}
    </button>
  );
}

