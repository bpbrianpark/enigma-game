'use client';

import './leaderboard.css';

type EntrySummary = {
  id: string;
  label: string;
  count: number;
};

interface TopEntriesPanelProps {
  entries: EntrySummary[];
}

export function TopEntriesPanel({ entries }: TopEntriesPanelProps) {
  const maxCount = entries.reduce(
    (max, entry) => (entry.count > max ? entry.count : max),
    0
  );

  return (
    <div className="top-entries-panel">
      <h2 className="top-entries-title">Top 25 Guessed Entries</h2>
      {entries.length === 0 ? (
        <div className="no-top-entries">No guesses recorded yet.</div>
      ) : (
        <ul className="top-entries-list">
          {entries.map((entry, index) => {
            const ratio =
              maxCount > 0 ? Math.max((entry.count / maxCount) * 100, 8) : 0;

            return (
              <li key={entry.id} className="top-entry">
                <div className="top-entry-rank">{index + 1}</div>
                <div className="top-entry-content">
                  <div className="top-entry-label">{entry.label}</div>
                  <div className="top-entry-bar-wrapper">
                    <div
                      className="top-entry-bar"
                      style={{ width: `${ratio}%` }}
                    />
                    <span className="top-entry-count">{entry.count}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

