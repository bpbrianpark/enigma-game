'use client'

import "./leaderboard.css";

import useSWR from "swr";
import { useState, useMemo } from "react";
import DifficultyPicker from "./DifficultyPicker";
import { DifficultyType, GameType, LeaderboardPropsType } from "./types";
import Link from "next/link";
import { TopEntriesPanel } from "./TopEntriesPanel";
import AdSlot from "./AdSlot";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.text();
        const details = body ? safeJson(body) : undefined;
        console.error("[Leaderboard] fetch failed", { url, status: res.status, body, details });
    }
    return res.json();
};

function safeJson(raw: string) {
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

export default function Leaderboard({ category, difficulties, initialGames, slug }: LeaderboardPropsType) {
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | null>(
        difficulties.length > 0 ? difficulties[0] : null
    );
    const [gameMode, setGameMode] = useState<'normal' | 'blitz'>('normal');

    const { data: games = initialGames, error: gamesError } = useSWR(
        `/api/games?slug=${slug}&difficultyId=${selectedDifficulty?.id}`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
            fallbackData: initialGames,
        }
    );

    const { data: topEntriesData, error: topEntriesError } = useSWR(
        `/api/leaderboard/top-entries?slug=${slug}`,
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false,
        }
    );

    const topEntries = Array.isArray(topEntriesData?.entries)
        ? topEntriesData.entries
        : [];

    if (gamesError) {
        console.error("[Leaderboard] Games request error", gamesError);
    }

    if (topEntriesError) {
        console.error("[Leaderboard] Top entries request error", topEntriesError);
    }

    const normalGames = useMemo(() => {
        if (!Array.isArray(games)) return [];
        return games.filter(
            (game: GameType) => game.isBlitzGame === null || game.isBlitzGame === undefined
        );
    }, [games]);

    const blitzGames = useMemo(() => {
        if (!Array.isArray(games)) return [];
        return games.filter((game: GameType) => game.isBlitzGame === true);
    }, [games]);

    const displayedGames = gameMode === 'blitz' ? blitzGames : normalGames;
    const sideAdSlotId =
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ??
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD;
    const bottomAdSlotId =
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD_BOTTOM ??
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM;

    return (
        <div className="leaderboard-page-shell">
            <aside className="leaderboard-side-rail">
                <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
            </aside>
            <div className="leaderboard-center-column">
            <div className="leaderboard-grid">
            <div className="leaderboard-side-panel">
                <TopEntriesPanel entries={topEntries} />
            </div>
            <div className="leaderboard">
                <h1 className="leaderboard-title">{category.name}</h1>
                {category.isDaily === false && (
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
                )}

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
                            </tr>
                        </thead>
                        <tbody>
                            {displayedGames.map((game: GameType, index: number) => (
                                <tr key={game.id}>
                                    <td className="rank" data-label="Rank">
                                        {index + 1}
                                    </td>
                                    <td className="username" data-label="Player">
                                        <Link href={`${baseUrl}/profile/${game.username}`}>
                                            {game.username}
                                        </Link>
                                    </td>
                                    <td className="time" data-label="Time">
                                        {formatTime(game.time)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            </div>
            {bottomAdSlotId ? (
                <AdSlot slot={bottomAdSlotId} className="bottom-banner-ad leaderboard-bottom-ad" />
            ) : null}
            </div>
            <aside className="leaderboard-side-rail">
                <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
            </aside>
        </div>
    );
}