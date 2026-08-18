import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import { useTyping } from '../hooks/useTyping';
import { ResultsDisplay } from './ResultsDisplay';
import { saveResult, checkIsPersonalBest } from '../utils';
import type { CharDisplay, TestDuration, StoredTestResult } from '../types';
import './TypingArea.css';

// ---------------------------------------------------------------------------
// Char — single character span, memoised to avoid cascading re-renders
// ---------------------------------------------------------------------------

interface CharProps {
  display: CharDisplay;
}

const Char = memo<CharProps>(({ display }) => {
  const { char, state } = display;
  const isSpace = char === ' ';

  const className = `char char--${state}${isSpace ? ' char--space' : ''}`;

  return (
    <span className={className} aria-hidden="true">
      {/* Non-breaking space keeps visual width intact for cursor/underline */}
      {isSpace ? '\u00A0' : char}
    </span>
  );
});

Char.displayName = 'Char';

// ---------------------------------------------------------------------------
// TypingArea
// ---------------------------------------------------------------------------

interface TypingAreaProps {
  history: StoredTestResult[];
  onResultSaved: () => void;
}

const DURATIONS: readonly TestDuration[] = [15, 30, 60];

export const TypingArea: React.FC<TypingAreaProps> = ({
  history,
  onResultSaved,
}) => {
  const {
    display,
    testState,
    duration,
    metrics,
    handleKeyDown,
    setDuration,
    reset,
  } = useTyping();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasSavedRef = useRef<boolean>(false);
  const [pbStatus, setPbStatus] = useState<{ isOverallPb: boolean; isModePb: boolean }>({
    isOverallPb: false,
    isModePb: false,
  });

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleRestart = useCallback(() => {
    reset();
    focusInput();
  }, [reset, focusInput]);

  /**
   * Saves completed test result to localStorage EXACTLY ONCE per test.
   */
  useEffect(() => {
    if (testState === 'finished' && !hasSavedRef.current) {
      hasSavedRef.current = true;

      // Evaluate Personal Best status against existing history
      const pb = checkIsPersonalBest(metrics.wpm, duration, history);
      setPbStatus(pb);

      // Persist to storage
      saveResult({
        duration,
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        accuracy: metrics.accuracy,
        correctChars: metrics.correctChars,
        incorrectChars: metrics.incorrectChars,
        elapsedSeconds: metrics.elapsedSeconds,
      });

      onResultSaved();
    } else if (testState === 'idle') {
      hasSavedRef.current = false;
      setPbStatus({ isOverallPb: false, isModePb: false });
    }
  }, [testState, metrics, duration, history, onResultSaved]);

  /**
   * Keydown handler for hidden input.
   */
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (testState === 'finished' && e.key === 'Enter') {
        e.preventDefault();
        handleRestart();
        return;
      }
      handleKeyDown(e);
    },
    [testState, handleKeyDown, handleRestart]
  );

  /**
   * Global keyboard shortcut: Enter restarts test when finished.
   */
  useEffect(() => {
    if (testState !== 'finished') return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [testState, handleRestart]);

  const sectionClass = [
    'typing-area',
    isFocused ? 'typing-area--focused' : 'typing-area--blurred',
    `typing-area--${testState}`,
  ].join(' ');

  return (
    <section
      className={sectionClass}
      onClick={focusInput}
      aria-label="Typing test"
    >
      {/* Hidden input — sole focus target */}
      <input
        ref={inputRef}
        className="typing-area__input"
        value=""
        onChange={() => {}}
        onKeyDown={handleInputKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Type here to begin the test"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Toolbar — Controls & Live Metrics */}
      <div className="typing-area__toolbar" onClick={(e) => e.stopPropagation()}>
        <div className="typing-area__controls">
          <div className="typing-area__modes" role="group" aria-label="Test duration selector">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`typing-area__mode-btn ${
                  duration === d ? 'typing-area__mode-btn--active' : ''
                }`}
                onClick={() => {
                  setDuration(d);
                  focusInput();
                }}
                disabled={testState === 'running'}
                aria-label={`${d} seconds mode`}
              >
                {d}s
              </button>
            ))}
          </div>

          <button
            type="button"
            className="typing-area__restart-icon-btn"
            onClick={handleRestart}
            aria-label="Restart test"
            title="Restart test"
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>

        {/* Live Metrics during test */}
        {testState !== 'finished' && (
          <div className="typing-area__metrics" aria-label="Live test metrics">
            <div className="typing-area__metric">
              <span className="typing-area__metric-label">TIME</span>
              <span className="typing-area__metric-val typing-area__metric-val--accent">
                {metrics.timeRemaining}s
              </span>
            </div>
            <div className="typing-area__metric">
              <span className="typing-area__metric-label">WPM</span>
              <span className="typing-area__metric-val">{metrics.wpm}</span>
            </div>
            <div className="typing-area__metric">
              <span className="typing-area__metric-label">ACC</span>
              <span className="typing-area__metric-val">{metrics.accuracy}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Passage Display */}
      {testState !== 'finished' && (
        <div className="typing-area__passage" aria-hidden="true">
          {display.map((charDisplay, i) => (
            <Char key={i} display={charDisplay} />
          ))}
        </div>
      )}

      {/* Finished State Results Experience */}
      {testState === 'finished' && (
        <ResultsDisplay
          metrics={metrics}
          duration={duration}
          isOverallPb={pbStatus.isOverallPb}
          isModePb={pbStatus.isModePb}
          onRestart={handleRestart}
        />
      )}

      {/* Focus hint — shown only while not focused and test is not finished */}
      {!isFocused && testState !== 'finished' && (
        <p className="typing-area__hint" aria-hidden="true">
          click to focus
        </p>
      )}
    </section>
  );
};

export default TypingArea;
