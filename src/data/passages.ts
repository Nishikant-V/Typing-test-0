/**
 * Typing passages — a curated set of short, punctuation-light sentences.
 * Each entry is 70–130 characters: enough for a meaningful test, short enough
 * that a user can complete it in under 60 seconds at average speed.
 */
const PASSAGES: readonly string[] = [
  'The quick brown fox jumps over the lazy dog sitting near the old riverbank.',
  'Not all those who wander are lost. The old that is strong does not wither.',
  'She stood at the window watching the city wake up, coffee growing cold in her hands.',
  'Every great journey begins with a single step taken in the right direction.',
  'The best time to plant a tree was twenty years ago. The second best time is now.',
  'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
  'It was the best of times, it was the worst of times, it was the age of wisdom.',
  'Words can light fires in the minds of men. Words can wring tears from the hardest hearts.',
  'There is nothing either good or bad, but thinking makes it so. To thine own self be true.',
  'Whatever you are, be a good one. Do everything you ask of others, and do it well.',
];

/** Returns a passage selected uniformly at random from the collection. */
export function getRandomPassage(): string {
  return PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
}
