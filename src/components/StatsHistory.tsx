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

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const StatsHistory: React.FC<StatsHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const stats = calculateStatistics(history);
  const recentTests = history.slice(0, 10);
  const hasHistory = history.length > 0;

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
        {hasHistory && (
          <button
            type="button"
            className="stats-history__clear-btn"
            onClick={handleClearClick}
          >
            Clear History
          </button>
        )}
      </div>

      {/* Aggregate Stats Summary — Pixel-aligned 1fr + 2fr layout */}
      <div className="stats-history__summary">
        {/* Personal Best Featured Hero Tile */}
        <div className="stats-card stats-card--hero">
          <div className="stats-card__header">
            <span className="stats-card__label">Personal Best</span>
            {stats.personalBestWpm > 0 && (
              <span className="stats-card__badge">Peak Metric</span>
            )}
          </div>
          <div className="stats-card__hero-body">
            <span className="stats-card__value stats-card__value--hero">
              {stats.personalBestWpm > 0 ? stats.personalBestWpm : '—'}
            </span>
            {stats.personalBestWpm > 0 && (
              <span className="stats-card__unit stats-card__unit--hero">WPM</span>
            )}
          </div>
        </div>

        {/* Secondary Compact Stat Cards */}
        <div className="stats-card__secondary-grid">
          <div className="stats-card">
            <span className="stats-card__label">Tests Completed</span>
            <span className="stats-card__value">
              {stats.testsCompleted > 0 ? stats.testsCompleted : '0'}
            </span>
          </div>
          <div className="stats-card">
            <span className="stats-card__label">Average WPM</span>
            <span className="stats-card__value">
              {stats.averageWpm > 0 ? stats.averageWpm : '—'}
            </span>
          </div>
          <div className="stats-card">
            <span className="stats-card__label">Average Accuracy</span>
            <span className="stats-card__value">
              {stats.averageAccuracy > 0 ? `${stats.averageAccuracy}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Duration Personal Bests */}
      <div className="stats-history__modes-grid">
        <div className="stats-mode">
          <span className="stats-mode__label">15s Best</span>
          <span className="stats-mode__value">
            {stats.best15sWpm > 0 ? `${stats.best15sWpm} WPM` : '—'}
          </span>
        </div>
        <div className="stats-mode">
          <span className="stats-mode__label">30s Best</span>
          <span className="stats-mode__value">
            {stats.best30sWpm > 0 ? `${stats.best30sWpm} WPM` : '—'}
          </span>
        </div>
        <div className="stats-mode">
          <span className="stats-mode__label">60s Best</span>
          <span className="stats-mode__value">
            {stats.best60sWpm > 0 ? `${stats.best60sWpm} WPM` : '—'}
          </span>
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
