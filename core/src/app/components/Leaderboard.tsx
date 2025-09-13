'use client'

import './leaderboard.css'

import { useCallback, useEffect, useState } from "react";
import DifficultyPicker from "./DifficultyPicker";
import { DifficultyType, GameType, LeaderboardPropsType } from './types';

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function Leaderboard({ category, difficulties, initialGames, slug }: LeaderboardPropsType) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | null>(
        difficulties.length > 0 ? difficulties[0] : null
    );
    const [games, setGames] = useState<GameType[]>(initialGames);

    const fetchGames = useCallback(async (difficultyId: string) => {
        try {
            const res = await fetch(`/api/games?slug=${slug}&difficultyId=${difficultyId}`, { 
                cache: "no-store" 
            });
            
            if (!res.ok) {
                console.error("Failed to fetch games");
                return;
            }
            
            const data = await res.json();
            setGames(Array.isArray(data) ? data.slice(0, 25) : []); 
        } catch (error) {
            console.error("Error fetching games:", error);
            setGames([]);
        }
    }, [slug]);

    const handleDifficultyChange = useCallback((difficulty: DifficultyType) => {
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
                {category.name}
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
                        <th className="table-text">Time</th>
                        <th className="table-text">Correct Guesses</th>
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
                                {formatTime(game.time)}
                            </td>
                            <td className="totalcount">
                                {game.correct_count}
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