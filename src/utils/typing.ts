import type { CharDisplay, CharState } from '../types';

/**
 * Pure function — derives the display state of every character in a passage
 * given the string the user has typed so far.
 *
 * Rules:
 *   i <  typed.length  →  correct | incorrect   (already typed)
 *   i == typed.length  →  current               (cursor position)
 *   i >  typed.length  →  untyped               (not yet reached)
 *
 * @param passage - The target text to type.
 * @param typed   - Characters typed by the user so far.
 */
export function buildDisplay(passage: string, typed: string): CharDisplay[] {
  return Array.from(passage).map((char, i): CharDisplay => {
    let state: CharState;

    if (i < typed.length) {
      state = typed[i] === char ? 'correct' : 'incorrect';
    } else if (i === typed.length) {
      state = 'current';
    } else {
      state = 'untyped';
    }

    return { char, state };
  });
}
