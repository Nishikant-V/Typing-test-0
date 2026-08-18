import type { CharDisplay, CharState, TypingMetrics } from '../types';

/**
 * Pure function — derives the display state of every character in a passage
 * given the string the user has typed so far.
 *
 * Rules:
 *   i <  typed.length  →  correct | incorrect   (already typed)
 *   i == typed.length  →  current               (cursor position, if active)
 *   i >  typed.length  →  untyped               (not yet reached)
 *
 * @param passage - The target text to type.
 * @param typed   - Characters typed by the user so far.
 * @param isFinished - Whether the test is completed (suppresses 'current' state).
 */
export function buildDisplay(passage: string, typed: string, isFinished = false): CharDisplay[] {
  return Array.from(passage).map((char, i): CharDisplay => {
    let state: CharState;

    if (i < typed.length) {
      state = typed[i] === char ? 'correct' : 'incorrect';
    } else if (i === typed.length && !isFinished) {
      state = 'current';
    } else {
      state = 'untyped';
    }

    return { char, state };
  });
}

/**
 * Pure function — calculates live typing metrics based on passage, typed string, duration, and timestamps.
 *
 * WPM = (correct characters / 5) / elapsed minutes
 * Accuracy = (correct characters / total typed characters) * 100
 */
export function calculateMetrics(
  passage: string,
  typed: string,
  durationSeconds: number,
  startTimeMs: number | null,
  endTimeMs: number | null,
  nowMs: number
): TypingMetrics {
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === passage[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  const totalTyped = typed.length;
  const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);

  let elapsedSeconds = 0;
  if (startTimeMs !== null) {
    const end = endTimeMs ?? nowMs;
    elapsedSeconds = Math.max(0, (end - startTimeMs) / 1000);
  }

  let wpm = 0;
  if (elapsedSeconds > 0) {
    const elapsedMinutes = elapsedSeconds / 60;
    wpm = Math.round((correctChars / 5) / elapsedMinutes);
  }

  const timeRemaining = Math.max(0, Math.ceil(durationSeconds - elapsedSeconds));

  return {
    wpm,
    accuracy,
    correctChars,
    incorrectChars,
    timeRemaining,
  };
}
