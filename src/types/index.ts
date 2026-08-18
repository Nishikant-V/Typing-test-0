/** The display state of a single character in the typing passage. */
export type CharState = 'untyped' | 'correct' | 'incorrect' | 'current';

/** The lifecycle state of a typing test session. */
export type TestState = 'idle' | 'running' | 'finished';

/** Display data for a single character — state drives the CSS class applied. */
export interface CharDisplay {
  char: string;
  state: CharState;
}
