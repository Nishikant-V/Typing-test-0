import React from 'react';
import type { StoredTestResult } from '../types';
import { calculateStatistics } from '../utils/statistics';
import './StatsHistory.css';

interface StatsHistoryProps {
  history: StoredTestResult[];
  onClearHistory: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  // If today, show time (e.g. 14:32)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Otherwise show Month Day (e.g. Aug 19)
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const StatsHistory: React.FC<StatsHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const stats = calculateStatistics(history);
  const recentTests = history.slice(0, 10);

  const handleClearClick = () => {
    if (window.confirm('Are you sure you want to clear all test history?')) {
      onClearHistory();
    }
  };

  return (
    <section className="stats-history" aria-label="Personal Statistics and Test History">
      {/* Header */}
      <div className="stats-history__header">
        <h2 className="stats-history__title">Statistics &amp; History</h2>
        {history.length > 0 && (
          <button
            type="button"
            className="stats-history__clear-btn"
            onClick={handleClearClick}
          >
            Clear History
          </button>
        )}
      </div>

      {/* Aggregate Stats Summary */}
      <div className="stats-history__summary-grid">
        <div className="stats-card">
          <span className="stats-card__label">Tests Completed</span>
          <span className="stats-card__value">{stats.testsCompleted}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__label">Personal Best</span>
          <span className="stats-card__value stats-card__value--accent">
            {stats.personalBestWpm} <span className="stats-card__unit">WPM</span>
          </span>
        </div>
        <div className="stats-card">
          <span className="stats-card__label">Average WPM</span>
          <span className="stats-card__value">{stats.averageWpm}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__label">Average Accuracy</span>
          <span className="stats-card__value">{stats.averageAccuracy}%</span>
        </div>
      </div>

      {/* Duration Personal Bests */}
      <div className="stats-history__modes-grid">
        <div className="stats-mode">
          <span className="stats-mode__label">15s Best</span>
          <span className="stats-mode__value">{stats.best15sWpm} WPM</span>
        </div>
        <div className="stats-mode">
          <span className="stats-mode__label">30s Best</span>
          <span className="stats-mode__value">{stats.best30sWpm} WPM</span>
        </div>
        <div className="stats-mode">
          <span className="stats-mode__label">60s Best</span>
          <span className="stats-mode__value">{stats.best60sWpm} WPM</span>
        </div>
      </div>

      {/* Recent History */}
      <div className="stats-history__recent">
        <h3 className="stats-history__section-subtitle">Recent Tests</h3>

        {recentTests.length === 0 ? (
          <p className="stats-history__empty">No tests recorded yet.</p>
        ) : (
          <div className="stats-history__table-wrapper">
            <table className="stats-history__table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Mode</th>
                  <th scope="col">WPM</th>
                  <th scope="col">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.timestamp)}</td>
                    <td>{item.duration}s</td>
                    <td className="stats-history__wpm-cell">{item.wpm}</td>
                    <td>{item.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
