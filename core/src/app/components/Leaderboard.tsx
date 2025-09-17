'use client'

import './leaderboard.css'

import useSWR from "swr"
import { useState, useMemo } from "react";
import DifficultyPicker from "./DifficultyPicker";
import { DifficultyType, GameType, LeaderboardPropsType } from './types';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Leaderboard({ category, difficulties, initialGames, slug }: LeaderboardPropsType) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | null>(
        difficulties.length > 0 ? difficulties[0] : null
    );
    const [gameMode, setGameMode] = useState<'normal' | 'blitz'>('normal');

    const { data: games = [] } = useSWR(`/api/games?slug=${slug}&difficultyId=${selectedDifficulty?.id}`, 
        fetcher,
        {
            keepPreviousData: true,   
            revalidateOnFocus: false, 
        });

    const normalGames = useMemo(() => {
        if (!Array.isArray(games)) return [];
        return games.filter((game: GameType) => game.isBlitzGame === null || game.isBlitzGame === undefined);
    }, [games]);

    const blitzGames = useMemo(() => {
        if (!Array.isArray(games)) return [];
        return games.filter((game: GameType) => game.isBlitzGame === true);
    }, [games]);

    const displayedGames = gameMode === 'blitz' ? blitzGames : normalGames;

    return (
        <div className="leaderboard">
            <h1 className="leaderboard-title">
                {category.name}
            </h1>
            
            <div className="leaderboard-controls">
                <DifficultyPicker
                    difficulties={difficulties}
                    selectedDifficulty={selectedDifficulty}
                    onDifficultyChange={setSelectedDifficulty}
                />
                
                <div className="game-mode-toggle">
                    <button 
                        className={`toggle-button ${gameMode === 'normal' ? 'active' : ''}`}
                        onClick={() => setGameMode('normal')}
                    >
                        Normal
                    </button>
                    <button 
                        className={`toggle-button ${gameMode === 'blitz' ? 'active' : ''}`}
                        onClick={() => setGameMode('blitz')}
                    >
                        Blitz
                    </button>
                </div>
            </div>

            {displayedGames.length === 0 ? (
                <div className="no-games-message">
                    No {gameMode} games found for this difficulty.
                </div>
            ) : (
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
                        {displayedGames.map((game: GameType, index: number) => (
                            <tr key={game.id}>
                                <td className="rank">
                                    {index + 1}
                                </td>
                                <td className="username">
                                    <Link href={`${baseUrl}/profile/${game.username}`}>
                                    {game.username}
                                    </Link>
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
            )}
        </div>
    );
}