"use client";

import "./button.css";
import { useRouter } from "next/navigation";

interface LeaderboardButtonProps {
  slug: string;
}

export default function LeaderboardButton({ slug }: LeaderboardButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/leaderboard/${slug}`);
  };

  return (
    <div className="leaderboard-wrapper">
      <button onClick={handleClick} className="leaderboard-button">
        Leaderboard
      </button>
    </div>
  );
}
