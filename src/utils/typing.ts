import type { CharDisplay, CharState, WordDisplay, WordStatus, TypingMetrics } from '../types';

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
 * Pure function — groups characters into WordDisplay objects with word-level statuses:
 * - 'completed': all characters in the word have been typed (fades out gracefully)
 * - 'active': currently being typed (subtle accent tint / underline)
 * - 'upcoming': not yet reached (standard untyped gray)
 */
export function buildWordDisplay(passage: string, typed: string, isFinished = false): WordDisplay[] {
  const chars = buildDisplay(passage, typed, isFinished);
  const words: WordDisplay[] = [];

  let currentWordChars: CharDisplay[] = [];
  let wordStartIndex = 0;
  let wordId = 0;

  for (let i = 0; i < chars.length; i++) {
    const charDisplay = chars[i];
    currentWordChars.push(charDisplay);

    const isSpace = charDisplay.char === ' ';
    const isLastChar = i === chars.length - 1;

    if (isSpace || isLastChar) {
      const wordEndIndex = i;
      let status: WordStatus;

      if (isFinished) {
        status = typed.length > wordStartIndex ? 'completed' : 'upcoming';
      } else if (typed.length > wordEndIndex) {
        status = 'completed';
      } else if (typed.length >= wordStartIndex && typed.length <= wordEndIndex) {
        status = 'active';
      } else {
        status = 'upcoming';
      }

      words.push({
        id: wordId++,
        status,
        chars: currentWordChars,
      });

      currentWordChars = [];
      wordStartIndex = i + 1;
    }
  }

  return words;
}

/**
 * Pure function — calculates live typing metrics based on passage, typed string, duration, and timestamps.
 *
 * Net WPM = (correct characters / 5) / elapsed minutes
 * Raw WPM = (total typed characters / 5) / elapsed minutes
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
  const rawAccuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);

  let elapsedSeconds = 0;
  if (startTimeMs !== null) {
    const end = endTimeMs ?? nowMs;
    elapsedSeconds = Math.max(0, (end - startTimeMs) / 1000);
  }

  let rawNetWpm = 0;
  let rawGrossWpm = 0;

  if (elapsedSeconds > 0) {
    const elapsedMinutes = elapsedSeconds / 60;
    rawNetWpm = (correctChars / 5) / elapsedMinutes;
    rawGrossWpm = (totalTyped / 5) / elapsedMinutes;
  }

  const wpm = Number.isFinite(rawNetWpm) ? Math.max(0, Math.round(rawNetWpm)) : 0;
  const rawWpm = Number.isFinite(rawGrossWpm) ? Math.max(0, Math.round(rawGrossWpm)) : 0;
  const accuracy = Number.isFinite(rawAccuracy) ? Math.min(100, Math.max(0, rawAccuracy)) : 100;
  const safeElapsedSeconds = Number.isFinite(elapsedSeconds)
    ? Math.max(0, Math.round(elapsedSeconds * 10) / 10)
    : 0;

  const timeRemaining = Math.max(0, Math.ceil(durationSeconds - elapsedSeconds));

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    timeRemaining,
    elapsedSeconds: safeElapsedSeconds,
  };
}
