import { useReducer, useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { CharDisplay, WordDisplay, TestDuration, TestState, TypingMetrics } from '../types';
import { buildDisplay, buildWordDisplay, calculateMetrics } from '../utils/typing';
import { getInitialPassage, generateWords } from '../data/passages';

// ---------------------------------------------------------------------------
// Streaming constants
// ---------------------------------------------------------------------------

/** When fewer than 120 characters (~20-25 words) remain, append more text */
const STREAM_REPLENISH_THRESHOLD = 120;
/** Number of additional words to append per replenishment */
const STREAM_CHUNK_WORDS = 30;

// ---------------------------------------------------------------------------
// Reducer state
// ---------------------------------------------------------------------------

interface State {
  passage: string;
  typed: string;
  testState: TestState;
  duration: TestDuration;
  hasPunctuation: boolean;
  hasNumbers: boolean;
  startTimeMs: number | null;
  endTimeMs: number | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'TYPE'; char: string; nowMs: number }
  | { type: 'BACKSPACE' }
  | { type: 'TICK'; nowMs: number }
  | { type: 'SET_DURATION'; duration: TestDuration }
  | { type: 'TOGGLE_PUNCTUATION' }
  | { type: 'TOGGLE_NUMBERS' }
  | { type: 'SET_PUNCTUATION'; enabled: boolean }
  | { type: 'SET_NUMBERS'; enabled: boolean }
  | { type: 'RESET'; duration?: TestDuration };

// ---------------------------------------------------------------------------
// Reducer — state transitions
// ---------------------------------------------------------------------------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TYPE': {
      if (state.testState === 'finished') return state;

      const newTyped = state.typed + action.char;
      const isFirstChar = state.testState === 'idle';
      const startTimeMs = isFirstChar ? action.nowMs : state.startTimeMs;

      // Check if we need to stream/append additional words seamlessly
      let passage = state.passage;
      const remainingChars = passage.length - newTyped.length;
      if (remainingChars < STREAM_REPLENISH_THRESHOLD) {
        const extraChunk = generateWords(STREAM_CHUNK_WORDS, {
          punctuation: state.hasPunctuation,
          numbers: state.hasNumbers,
        });
        passage = passage + ' ' + extraChunk;
      }

      return {
        ...state,
        passage,
        typed: newTyped,
        testState: 'running',
        startTimeMs,
      };
    }

    case 'BACKSPACE': {
      if (state.testState === 'finished') return state;
      if (state.typed.length === 0) return state;
      return { ...state, typed: state.typed.slice(0, -1) };
    }

    case 'TICK': {
      if (state.testState !== 'running' || state.startTimeMs === null) return state;
      const elapsedSeconds = (action.nowMs - state.startTimeMs) / 1000;
      if (elapsedSeconds >= state.duration) {
        return {
          ...state,
          testState: 'finished',
          endTimeMs: state.startTimeMs + state.duration * 1000,
        };
      }
      return state;
    }

    case 'SET_DURATION': {
      if (state.testState === 'running') return state;
      return {
        ...state,
        duration: action.duration,
        typed: '',
        testState: 'idle',
        startTimeMs: null,
        endTimeMs: null,
        passage: getInitialPassage(action.duration, {
          punctuation: state.hasPunctuation,
          numbers: state.hasNumbers,
        }),
      };
    }

    case 'TOGGLE_PUNCTUATION': {
      if (state.testState === 'running') return state;
      const nextPunctuation = !state.hasPunctuation;
      return {
        ...state,
        hasPunctuation: nextPunctuation,
        passage: getInitialPassage(state.duration, {
          punctuation: nextPunctuation,
          numbers: state.hasNumbers,
        }),
        typed: '',
        testState: 'idle',
        startTimeMs: null,
        endTimeMs: null,
      };
    }

    case 'TOGGLE_NUMBERS': {
      if (state.testState === 'running') return state;
      const nextNumbers = !state.hasNumbers;
      return {
        ...state,
        hasNumbers: nextNumbers,
        passage: getInitialPassage(state.duration, {
          punctuation: state.hasPunctuation,
          numbers: nextNumbers,
        }),
        typed: '',
        testState: 'idle',
        startTimeMs: null,
        endTimeMs: null,
      };
    }

    case 'SET_PUNCTUATION': {
      if (state.testState === 'running' || state.hasPunctuation === action.enabled) return state;
      return {
        ...state,
        hasPunctuation: action.enabled,
        passage: getInitialPassage(state.duration, {
          punctuation: action.enabled,
          numbers: state.hasNumbers,
        }),
        typed: '',
        testState: 'idle',
        startTimeMs: null,
        endTimeMs: null,
      };
    }

    case 'SET_NUMBERS': {
      if (state.testState === 'running' || state.hasNumbers === action.enabled) return state;
      return {
        ...state,
        hasNumbers: action.enabled,
        passage: getInitialPassage(state.duration, {
          punctuation: state.hasPunctuation,
          numbers: action.enabled,
        }),
        typed: '',
        testState: 'idle',
        startTimeMs: null,
        endTimeMs: null,
      };
    }

    case 'RESET': {
      const nextDuration = action.duration ?? state.duration;
      return {
        ...state,
        passage: getInitialPassage(nextDuration, {
          punctuation: state.hasPunctuation,
          numbers: state.hasNumbers,
        }),
        typed: '',
        testState: 'idle',
        duration: nextDuration,
        startTimeMs: null,
        endTimeMs: null,
      };
    }
  }
}

function makeInitialState(): State {
  return {
    passage: getInitialPassage(30, { punctuation: false, numbers: false }),
    typed: '',
    testState: 'idle',
    duration: 30,
    hasPunctuation: false,
    hasNumbers: false,
    startTimeMs: null,
    endTimeMs: null,
  };
}

// ---------------------------------------------------------------------------
// Public hook interface
// ---------------------------------------------------------------------------

export interface UseTypingReturn {
  words: WordDisplay[];
  display: CharDisplay[];
  testState: TestState;
  duration: TestDuration;
  metrics: TypingMetrics;
  hasPunctuation: boolean;
  hasNumbers: boolean;
  handleKeyDown: (e: KeyboardEvent) => void;
  setDuration: (duration: TestDuration) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  setPunctuation: (enabled: boolean) => void;
  setNumbers: (enabled: boolean) => void;
  reset: (duration?: TestDuration) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTyping(): UseTypingReturn {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (state.testState !== 'running') return;

    setNowMs(Date.now());

    const interval = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      dispatch({ type: 'TICK', nowMs: current });
    }, 100);

    return () => clearInterval(interval);
  }, [state.testState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'BACKSPACE' });
        return;
      }

      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      e.preventDefault();
      dispatch({ type: 'TYPE', char: e.key, nowMs: Date.now() });
    },
    []
  );

  const setDuration = useCallback((duration: TestDuration) => {
    dispatch({ type: 'SET_DURATION', duration });
  }, []);

  const togglePunctuation = useCallback(() => {
    dispatch({ type: 'TOGGLE_PUNCTUATION' });
  }, []);

  const toggleNumbers = useCallback(() => {
    dispatch({ type: 'TOGGLE_NUMBERS' });
  }, []);

  const setPunctuation = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_PUNCTUATION', enabled });
  }, []);

  const setNumbers = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_NUMBERS', enabled });
  }, []);

  const reset = useCallback((duration?: TestDuration) => {
    dispatch({ type: 'RESET', duration });
  }, []);

  const display = buildDisplay(state.passage, state.typed, state.testState === 'finished');
  const words = buildWordDisplay(state.passage, state.typed, state.testState === 'finished');
  const metrics = calculateMetrics(
    state.passage,
    state.typed,
    state.duration,
    state.startTimeMs,
    state.endTimeMs,
    nowMs
  );

  return {
    words,
    display,
    testState: state.testState,
    duration: state.duration,
    metrics,
    hasPunctuation: state.hasPunctuation,
    hasNumbers: state.hasNumbers,
    handleKeyDown,
    setDuration,
    togglePunctuation,
    toggleNumbers,
    setPunctuation,
    setNumbers,
    reset,
  };
}
