"use client";

import "./button.css";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

interface LeaderboardButtonProps {
  slug: string;
}

export default function LeaderboardButton({ slug }: LeaderboardButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/leaderboard/${slug}`);
  };

  return (
    <button onClick={handleClick} className="header-button">
      <Trophy className="header-button-icon" />
      Leaderboard
    </button>
  );
}
