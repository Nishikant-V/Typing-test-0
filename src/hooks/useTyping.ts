import { useReducer, useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { CharDisplay, TestDuration, TestState, TypingMetrics } from '../types';
import { buildDisplay, calculateMetrics } from '../utils/typing';
import { getRandomPassage } from '../data/passages';

// ---------------------------------------------------------------------------
// Reducer state
// ---------------------------------------------------------------------------

interface State {
  passage: string;
  typed: string;
  testState: TestState;
  duration: TestDuration;
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
  | { type: 'RESET'; duration?: TestDuration };

// ---------------------------------------------------------------------------
// Reducer — state transitions
// ---------------------------------------------------------------------------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TYPE': {
      if (state.testState === 'finished') return state;
      if (state.typed.length >= state.passage.length) return state;

      const newTyped = state.typed + action.char;
      const isComplete = newTyped.length === state.passage.length;
      const isFirstChar = state.testState === 'idle';
      const startTimeMs = isFirstChar ? action.nowMs : state.startTimeMs;

      const testState: TestState = isComplete ? 'finished' : 'running';
      const endTimeMs = isComplete ? action.nowMs : null;

      return {
        ...state,
        typed: newTyped,
        testState,
        startTimeMs,
        endTimeMs,
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
        passage: getRandomPassage(),
      };
    }

    case 'RESET': {
      const nextDuration = action.duration ?? state.duration;
      return {
        passage: getRandomPassage(),
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
    passage: getRandomPassage(),
    typed: '',
    testState: 'idle',
    duration: 30,
    startTimeMs: null,
    endTimeMs: null,
  };
}

// ---------------------------------------------------------------------------
// Public hook interface
// ---------------------------------------------------------------------------

export interface UseTypingReturn {
  display: CharDisplay[];
  testState: TestState;
  duration: TestDuration;
  metrics: TypingMetrics;
  handleKeyDown: (e: KeyboardEvent) => void;
  setDuration: (duration: TestDuration) => void;
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

  const reset = useCallback((duration?: TestDuration) => {
    dispatch({ type: 'RESET', duration });
  }, []);

  const display = buildDisplay(state.passage, state.typed, state.testState === 'finished');
  const metrics = calculateMetrics(
    state.passage,
    state.typed,
    state.duration,
    state.startTimeMs,
    state.endTimeMs,
    nowMs
  );

  return {
    display,
    testState: state.testState,
    duration: state.duration,
    metrics,
    handleKeyDown,
    setDuration,
    reset,
  };
}
