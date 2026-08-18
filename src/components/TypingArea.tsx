import React, { useRef, useState, useCallback, memo } from 'react';
import { useTyping } from '../hooks/useTyping';
import type { CharDisplay, TestDuration } from '../types';
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
      {/*
        Non-breaking space keeps the character's visual width intact
        so the cursor and underline decorations render correctly on spaces.
      */}
      {isSpace ? '\u00A0' : char}
    </span>
  );
});

Char.displayName = 'Char';

// ---------------------------------------------------------------------------
// TypingArea
// ---------------------------------------------------------------------------

const DURATIONS: readonly TestDuration[] = [15, 30, 60];

const TypingArea: React.FC = () => {
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

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Extends the hook's keydown handler with one app-level concern:
   * pressing Enter when the test is finished triggers a reset.
   */
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (testState === 'finished' && e.key === 'Enter') {
        e.preventDefault();
        reset();
        return;
      }
      handleKeyDown(e);
    },
    [testState, handleKeyDown, reset]
  );

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
            onClick={() => {
              reset();
              focusInput();
            }}
            aria-label="Restart test"
            title="Restart test"
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>

        {/* Live Metrics */}
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
          <div className="typing-area__metric">
            <span className="typing-area__metric-label">CHARS</span>
            <span className="typing-area__metric-val">
              <span className="typing-area__correct-count">{metrics.correctChars}</span>
              <span className="typing-area__slash">/</span>
              <span className="typing-area__incorrect-count">{metrics.incorrectChars}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Passage Display */}
      <div className="typing-area__passage" aria-hidden="true">
        {display.map((charDisplay, i) => (
          <Char key={i} display={charDisplay} />
        ))}
      </div>

      {/* Finished State Summary */}
      {testState === 'finished' && (
        <div className="typing-area__finished" role="status">
          <div className="typing-area__finished-info">
            <p className="typing-area__finished-title">Test Complete</p>
            <p className="typing-area__finished-stats">
              {metrics.wpm} WPM &bull; {metrics.accuracy}% Accuracy &bull; {metrics.correctChars} correct / {metrics.incorrectChars} errors
            </p>
          </div>
          <button
            type="button"
            className="typing-area__restart"
            onClick={(e) => {
              e.stopPropagation();
              reset();
              focusInput();
            }}
          >
            Next passage <span aria-hidden="true">↵</span>
          </button>
          <p className="typing-area__hint" aria-hidden="true">
            or press Enter
          </p>
        </div>
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
