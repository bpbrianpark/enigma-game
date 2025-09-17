"use client";

import "./profile-client.css";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileClientPropsType } from "./types";

export default function ProfileClient({
    difficulties,
    categories,
    user,
    games
}: ProfileClientPropsType) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const router = useRouter();

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => b.id.localeCompare(a.id));
  }, [games]);

  const stats = useMemo(() => {
    const totalGames = games.length;
    const completedGames = games.filter(game => game.correct_count >= game.targetCount).length;
    const averageCorrect = totalGames > 0 ? 
      Math.round(games.reduce((sum, game) => sum + game.correct_count, 0) / totalGames) : 0;
    const bestScore = totalGames > 0 ? Math.max(...games.map(game => game.correct_count)) : 0;
    
    return {
      totalGames,
      completedGames,
      averageCorrect,
      bestScore
    };
  }, [games]);

  const findCategoryName = (slug: string) => {
    const category = categories.find(cat => cat.slug === slug);
    return category?.name || slug;
  };

  const normalGames = useMemo(() => {
  return sortedGames.filter(game => game.isBlitzGame === null || game.isBlitzGame === undefined);
}, [sortedGames]);

const blitzGames = useMemo(() => {
  return sortedGames.filter(game => game.isBlitzGame === true);
}, [sortedGames]);

  const findDifficulty = (difficultyId: string) => {
  const difficulty = difficulties.find(diff => diff.id === difficultyId);
  if (!difficulty) return 'Unknown';
  
  switch (difficulty.level) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    case 4:
      return 'Expert';
    case 5:
      return 'Master';
    default:
      return `Level ${difficulty.level}`;
  }
}

const formatBlitzTime = (difficultyId: string) => {
  const difficulty = difficulties.find(diff => diff.id === difficultyId);
  return formatTime(difficulty?.timeLimit) || 0
}

    function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }   

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-photo">
          {user.image ? (
            <img src={user.image} alt={`${user.username}'s profile`} />
          ) : (
            <div className="profile-initials">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1 className="username">@{user.username}</h1>
          <p className="member-since">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="stats-section">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalGames}</div>
            <div className="stat-label">Total Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completedGames}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="games-section">
        <h2>Normal Game History</h2>
        {normalGames.length === 0 ? (
          <div className="no-games">
            <p>No games played yet.</p>
          </div>
        ) : (
          <div className="games-list">
            {normalGames.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <div className="game-info">
                    <span className="profile-category-name">{findCategoryName(game.slug)}</span>
                  </div>
                  <div className="game-status">
                    {game.correct_count >= game.targetCount ? (
                      <span className="status-completed">✓ Completed</span>
                    ) : (
                      <span className="status-incomplete">Incomplete</span>
                    )}
                  </div>
                </div>
                
                <div className="game-stats">
                  <div className="game-stat">
                    <span className="stat-value">{game.correct_count}/{game.targetCount}</span>
                    <span className="stat-name">Score</span>
                  </div>
                  <div className="game-stat">
                    <span className="stat-value">{formatTime(game.time)}</span>
                    <span className="stat-name">Time</span>
                  </div>
                  <div className="game-stat">
                    <span className="stat-value">{findDifficulty(game.difficultyId)}</span>
                    <span className="stat-name">Difficulty</span>
                  </div>
                </div>

                {game.correct_count >= game.targetCount && (
                  <div className="completion-time">
                    Completed {game.targetCount} items in {formatTime(game.time)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="games-section">
        <h2>Blitz Game History</h2>
        {blitzGames.length === 0 ? (
          <div className="no-games">
            <p>No blitz games played yet.</p>
          </div>
        ) : (
          <div className="games-list">
            {blitzGames.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <div className="game-info">
                    <span className="profile-category-name">{findCategoryName(game.slug)}</span>
                  </div>
                </div>
                
                <div className="game-stats">
                  <div className="game-stat">
                    <span className="stat-value">{game.correct_count}</span>
                    <span className="stat-name">Count</span>
                  </div>
                  <div className="game-stat">
                    <span className="stat-value">{formatBlitzTime(game.difficultyId)}</span>
                    <span className="stat-name">Time Limit</span>
                  </div>
                </div>

                {game.correct_count >= game.targetCount && (
                  <div className="completion-time">
                    Completed {game.correct_count} items in {formatTime(findDifficulty(game.difficultyId).timeLimit)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}