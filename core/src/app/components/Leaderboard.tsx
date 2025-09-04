'use client'

import { Category, Difficulty, Game } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import DifficultyPicker from "./DifficultyPicker";

interface LeaderboardProps { 
    category: Category;
    difficulties: Difficulty[];
    initialGames: Game[];
    slug: string;
}

export default function Leaderboard({ category, difficulties, initialGames, slug }: LeaderboardProps) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(
        difficulties.length > 0 ? difficulties[0] : null
    );
    const [games, setGames] = useState<Game[]>(initialGames);

    const fetchGames = useCallback(async (difficultyId: string) => {
        const url = new URL(`http://localhost:3000/api/games`);
        url.searchParams.set("slug", slug);
        url.searchParams.set("difficultyId", difficultyId);

        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) {
            console.error("Failed to fetch games");
            return;
        }
        const data = await res.json();
        setGames(data.slice(0, 25)); 
    }, [slug]);

    const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        fetchGames(difficulty.id);
    }, [fetchGames]);

    useEffect(() => {
        if (selectedDifficulty) {
            fetchGames(selectedDifficulty.id);
        }
    }, [selectedDifficulty, fetchGames]);

    return (
        <div className="leaderboard">
            <h1 className="leaderboard-title">
                {category.name} Leaderboard ({selectedDifficulty?.level})
            </h1>
            <DifficultyPicker
                difficulties={difficulties}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={handleDifficultyChange}
            />

            <table className="leaderboard-table">
                <thead>
                    <tr className="table-headings">
                        <th className="table-text">Rank</th>
                        <th className="table-text">Player</th>
                        <th className="table-text">Time (s)</th>
                        <th className="table-text">Targets</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game, index) => (
                        <tr key={game.id}>
                            <td className="rank">
                                {index + 1}
                            </td>
                            <td className="username">
                                {game.username}
                            </td>
                            <td className="time">
                                {game.time}
                            </td>
                            <td className="totalcount">
                                {game.targetCount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
