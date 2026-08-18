/** The display state of a single character in the typing passage. */
export type CharState = 'untyped' | 'correct' | 'incorrect' | 'current';

/** The lifecycle state of a typing test session. */
export type TestState = 'idle' | 'running' | 'finished';

/** Supported test durations in seconds. */
export type TestDuration = 15 | 30 | 60;

/** Display data for a single character — state drives the CSS class applied. */
export interface CharDisplay {
  char: string;
  state: CharState;
}

/** Real-time metrics calculated for the current typing test session. */
export interface TypingMetrics {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  timeRemaining: number;
  elapsedSeconds: number;
}

/** Stored result of a completed typing test session. */
export interface StoredTestResult {
  id: string;
  timestamp: number;
  duration: TestDuration;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  elapsedSeconds: number;
}

/** Aggregated personal statistics derived from test history. */
export interface UserStatistics {
  testsCompleted: number;
  personalBestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  best15sWpm: number;
  best30sWpm: number;
  best60sWpm: number;
}
