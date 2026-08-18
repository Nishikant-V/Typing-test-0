import { useReducer, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { CharDisplay, TestState } from '../types';
import { buildDisplay } from '../utils/typing';
import { getRandomPassage } from '../data/passages';

// ---------------------------------------------------------------------------
// Reducer state
// ---------------------------------------------------------------------------

interface State {
  passage: string;
  typed: string;
  testState: TestState;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'TYPE'; char: string }
  | { type: 'BACKSPACE' }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Reducer — every state transition lives here
// ---------------------------------------------------------------------------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TYPE': {
      // Guard: no typing past end or after completion
      if (state.testState === 'finished') return state;
      if (state.typed.length >= state.passage.length) return state;

      const newTyped = state.typed + action.char;
      const isComplete = newTyped.length === state.passage.length;

      // Transition: idle → running on first character; running → finished when done
      const testState: TestState = isComplete
        ? 'finished'
        : state.testState === 'idle'
        ? 'running'
        : state.testState;

      return { ...state, typed: newTyped, testState };
    }

    case 'BACKSPACE': {
      // Guard: no backspace when finished or nothing typed yet
      if (state.testState === 'finished') return state;
      if (state.typed.length === 0) return state;
      // Simply shorten the typed string — buildDisplay recalculates all states
      return { ...state, typed: state.typed.slice(0, -1) };
    }

    case 'RESET':
      return { passage: getRandomPassage(), typed: '', testState: 'idle' };
  }
}

function makeInitialState(): State {
  return { passage: getRandomPassage(), typed: '', testState: 'idle' };
}

// ---------------------------------------------------------------------------
// Public hook interface
// ---------------------------------------------------------------------------

export interface UseTypingReturn {
  display: CharDisplay[];
  testState: TestState;
  handleKeyDown: (e: KeyboardEvent) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTyping(): UseTypingReturn {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  /**
   * Handles raw keyboard events from the hidden input.
   * Only Backspace and single printable characters are acted on.
   * Keyboard shortcuts (Ctrl/Alt/Meta + key) are ignored.
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      dispatch({ type: 'BACKSPACE' });
      return;
    }

    // Single printable character — length check excludes "ArrowLeft", "Enter", etc.
    if (e.key.length !== 1) return;

    // Let Ctrl/Alt/Meta shortcuts (copy, paste, etc.) fall through
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    e.preventDefault();
    dispatch({ type: 'TYPE', char: e.key });
  }, []); // dispatch is stable; no deps needed

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const display = buildDisplay(state.passage, state.typed);

  return { display, testState: state.testState, handleKeyDown, reset };
}
