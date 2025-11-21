'use client'

import "./leaderboard.css";

import useSWR from "swr";
import { useState, useMemo } from "react";
import DifficultyPicker from "./DifficultyPicker";
import { DifficultyType, GameType, LeaderboardPropsType } from "./types";
import Link from "next/link";
import { TopEntriesPanel } from "./TopEntriesPanel";
import BackToCategoriesButton from "./BackToCategoriesButton";
import AdSlot from "./AdSlot";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
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

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="rank-icon rank-icon-gold" />;
            case 2:
                return <Medal className="rank-icon rank-icon-silver" />;
            case 3:
                return <Medal className="rank-icon rank-icon-bronze" />;
            default:
                return <span className="rank-number">#{rank}</span>;
        }
    };

    return (
        <div className="leaderboard-page-shell">
            <aside className="leaderboard-side-rail">
                <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
            </aside>
            <div className="leaderboard-center-column">
                <div className="leaderboard-container">
                    <div className="leaderboard-header-section">
                        <BackToCategoriesButton />
                    </div>

                    <div className="leaderboard-hero-section">
                        <Trophy className="leaderboard-trophy-icon" />
                        <h1 className="leaderboard-main-title">Leaderboard</h1>
                    </div>

                    <div className="leaderboard-content-grid">
                        <div className="leaderboard-side-card">
                            <TopEntriesPanel entries={topEntries} />
                        </div>

                        <div className="leaderboard-main-card">
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
                                <div className="leaderboard-table-wrapper">
                                    <table className="leaderboard-table">
                                        <thead>
                                            <tr>
                                                <th className="table-head">Rank</th>
                                                <th className="table-head">Player</th>
                                                <th className="table-head table-head-right">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedGames.map((game: GameType, index: number) => (
                                                <tr key={game.id} className="table-row">
                                                    <td className="table-cell">
                                                        <div className="rank-cell">
                                                            {getRankIcon(index + 1)}
                                                        </div>
                                                    </td>
                                                    <td className="table-cell table-cell-player">
                                                        <Link href={`${baseUrl}/profile/${game.username}`} className="player-link">
                                                            {game.username}
                                                        </Link>
                                                    </td>
                                                    <td className="table-cell table-cell-right table-cell-time">
                                                        {formatTime(game.time)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="leaderboard-footer">
                        <p className="leaderboard-footer-text">
                            Keep playing to climb the ranks!
                        </p>
                        <button 
                            className="leaderboard-play-button"
                            onClick={() => router.push("/categories")}
                        >
                            Play More Quizzes
                        </button>
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