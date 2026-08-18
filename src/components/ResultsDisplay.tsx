import React from 'react';
import type { TypingMetrics, TestDuration } from '../types';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  metrics: TypingMetrics;
  duration: TestDuration;
  isOverallPb?: boolean;
  isModePb?: boolean;
  onRestart: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  metrics,
  duration,
  isOverallPb = false,
  isModePb = false,
  onRestart,
}) => {
  return (
    <div className="results" role="region" aria-label="Typing test results">
      {/* Primary Result: WPM & Personal Best Badge */}
      <div className="results__hero">
        <div className="results__wpm-group">
          <span className="results__wpm-value">{metrics.wpm}</span>
          <span className="results__wpm-label">wpm</span>
        </div>

        {isOverallPb && (
          <span className="results__pb-badge" title="Overall Personal Best WPM!">
            ★ Personal Best
          </span>
        )}
        {!isOverallPb && isModePb && (
          <span className="results__pb-badge" title={`${duration}s Personal Best WPM!`}>
            ★ {duration}s Best
          </span>
        )}
      </div>

      {/* Secondary Metrics Grid */}
      <div className="results__grid">
        <div className="results__stat">
          <span className="results__stat-label">Accuracy</span>
          <span className="results__stat-value">{metrics.accuracy}%</span>
        </div>
        <div className="results__stat">
          <span className="results__stat-label">Raw WPM</span>
          <span className="results__stat-value">{metrics.rawWpm}</span>
        </div>
        <div className="results__stat">
          <span className="results__stat-label">Correct</span>
          <span className="results__stat-value results__stat-value--correct">
            {metrics.correctChars}
          </span>
        </div>
        <div className="results__stat">
          <span className="results__stat-label">Incorrect</span>
          <span className="results__stat-value results__stat-value--incorrect">
            {metrics.incorrectChars}
          </span>
        </div>
        <div className="results__stat">
          <span className="results__stat-label">Time</span>
          <span className="results__stat-value">
            {metrics.elapsedSeconds}s / {duration}s
          </span>
        </div>
      </div>

      {/* Action & Keyboard Shortcut Hint */}
      <div className="results__actions">
        <button
          type="button"
          className="results__restart-btn"
          onClick={onRestart}
          aria-label="Restart test"
        >
          Restart Test <kbd className="results__kbd">Enter ↵</kbd>
        </button>
      </div>
    </div>
  );
};
