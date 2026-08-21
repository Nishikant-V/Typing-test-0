import type { TestDuration } from '../types';

/**
 * Passage options for text selection/generation.
 */
export interface PassageOptions {
  punctuation?: boolean;
  numbers?: boolean;
}

/**
 * Curated list of common English words for typing tests (Monkeytype style).
 */
export const WORDS: readonly string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it',
  'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'his', 'from', 'say', 'her', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
  'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great',
  'water', 'long', 'find', 'world', 'very', 'still', 'nation', 'hand', 'life', 'tell',
  'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call',
  'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same',
  'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'point',
  'place', 'form', 'child', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest',
  'large', 'person', 'end', 'open', 'public', 'follow', 'during', 'present', 'without', 'again',
  'hold', 'govern', 'around', 'possible', 'head', 'consider', 'word', 'program', 'problem', 'however',
  'lead', 'system', 'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact',
  'group', 'play', 'stand', 'increase', 'early', 'course', 'change', 'help', 'line', 'city'
];

/**
 * Natural contractions with apostrophes for punctuation mode.
 */
export const CONTRACTIONS: readonly string[] = [
  "don't", "it's", "can't", "won't", "we're", "they'll", "you've", "life's",
  "that's", "let's", "couldn't", "wouldn't", "isn't", "haven't", "there's",
  "we've", "didn't", "shouldn't", "aren't", "what's"
];

/**
 * Common standalone numbers for numbers mode.
 */
export const NUMBERS_POOL: readonly string[] = [
  '42', '2024', '15', '7', '365', '100', '1999', '50', '10', '80',
  '24', '12', '3', '500', '2030', '1969', '18', '60', '9', '2',
  '14', '742', '402', '1', '25', '99', '120', '5', '4', '8'
];

/**
 * Recommended target word counts per test duration to ensure generous headroom (up to ~200 WPM).
 * - 15s: 50 words (up to 200 WPM burst)
 * - 30s: 95 words (up to 190 WPM)
 * - 60s: 190 words (up to 190 WPM)
 */
export function getWordCountForDuration(duration: TestDuration): number {
  switch (duration) {
    case 15:
      return 50;
    case 30:
      return 95;
    case 60:
      return 190;
    default:
      return 95;
  }
}

/**
 * Generates a stream of words customized according to active options.
 *
 * @param count - Number of words to generate.
 * @param options - Punctuation and Numbers toggle states.
 */
export function generateWords(count: number, options?: PassageOptions): string {
  const punctuation = options?.punctuation ?? false;
  const numbers = options?.numbers ?? false;

  const resultWords: string[] = [];
  let isStartOfSentence = true;

  for (let i = 0; i < count; i++) {
    let word: string;

    // Check if we should insert a number (~12% chance when numbers mode is active)
    if (numbers && Math.random() < 0.12) {
      word = NUMBERS_POOL[Math.floor(Math.random() * NUMBERS_POOL.length)];
      isStartOfSentence = false;
    } else {
      // Pick either a contraction (~15% chance in punctuation mode) or standard word
      if (punctuation && Math.random() < 0.15) {
        word = CONTRACTIONS[Math.floor(Math.random() * CONTRACTIONS.length)];
      } else {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
      }

      // Handle sentence capitalization
      if (punctuation && isStartOfSentence) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        isStartOfSentence = false;
      }
    }

    // Apply natural punctuation marks (commas, periods, quotes, colons, question marks)
    if (punctuation && !numbers && word.match(/^[0-9]+$/)) {
      // don't punctuate if not applicable
    } else if (punctuation) {
      const rand = Math.random();
      // Every 5-9 words, terminate or pause a sentence clause
      if (i > 0 && i < count - 1) {
        if (rand < 0.08) {
          // Period - ends sentence
          word += '.';
          isStartOfSentence = true;
        } else if (rand < 0.16) {
          // Comma
          word += ',';
        } else if (rand < 0.19) {
          // Question mark
          word += '?';
          isStartOfSentence = true;
        } else if (rand < 0.21) {
          // Semicolon
          word += ';';
        } else if (rand < 0.23) {
          // Colon
          word += ':';
        } else if (rand < 0.25) {
          // Exclamation mark
          word += '!';
          isStartOfSentence = true;
        }
      } else if (i === count - 1) {
        // End passage with a period or exclamation
        word += '.';
      }
    }

    resultWords.push(word);
  }

  return resultWords.join(' ');
}

/**
 * Returns an initial passage sized for the specified test duration.
 */
export function getInitialPassage(duration: TestDuration = 30, options?: PassageOptions): string {
  const count = getWordCountForDuration(duration);
  return generateWords(count, options);
}

/**
 * Returns a passage (backward compatible interface).
 */
export function getRandomPassage(options?: PassageOptions, duration: TestDuration = 30): string {
  return getInitialPassage(duration, options);
}
