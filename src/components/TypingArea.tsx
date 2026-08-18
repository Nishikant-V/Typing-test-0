import React, { useRef, useState, useCallback, memo } from 'react';
import { useTyping } from '../hooks/useTyping';
import type { CharDisplay } from '../types';
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

const TypingArea: React.FC = () => {
  const { display, testState, handleKeyDown, reset } = useTyping();
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
        // Input stays focused — no DOM change affects the input element itself
        return;
      }
      handleKeyDown(e);
    },
    [testState, handleKeyDown, reset],
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
      {/*
        Hidden input — the sole keyboard focus target.
        Always present in the DOM so focus is not lost during state transitions.
        value="" + onChange no-op: controlled input that stays empty.
        e.preventDefault() in onKeyDown prevents characters from being inserted.
      */}
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

      {testState === 'finished' ? (
        /* ---- Finished state ---- */
        <div className="typing-area__finished" role="status">
          <p className="typing-area__finished-msg">Passage complete.</p>
          <button
            className="typing-area__restart"
            onClick={(e) => {
              e.stopPropagation(); // prevent section onClick from firing
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
      ) : (
        /* ---- Active typing display ---- */
        <div className="typing-area__passage" aria-hidden="true">
          {display.map((charDisplay, i) => (
            <Char key={i} display={charDisplay} />
          ))}
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
