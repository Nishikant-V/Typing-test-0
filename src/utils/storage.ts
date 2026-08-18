import type { StoredTestResult } from '../types';

const STORAGE_KEY = 'typespeed:test-history:v1';

/** Generates a unique identifier for stored test results. */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely retrieves all stored test results from localStorage.
 * Returns an empty array if storage is missing, malformed, or unavailable.
 */
export function getResults(): StoredTestResult[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Schema validation guard against corrupted localStorage
    return parsed.filter((item): item is StoredTestResult => {
      return (
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.timestamp === 'number' &&
        (item.duration === 15 || item.duration === 30 || item.duration === 60) &&
        typeof item.wpm === 'number' &&
        typeof item.rawWpm === 'number' &&
        typeof item.accuracy === 'number' &&
        typeof item.correctChars === 'number' &&
        typeof item.incorrectChars === 'number' &&
        typeof item.elapsedSeconds === 'number'
      );
    });
  } catch {
    return [];
  }
}

/**
 * Safely persists a new completed test result to localStorage.
 * Returns the newly created entry or null if storage fails.
 */
export function saveResult(
  data: Omit<StoredTestResult, 'id' | 'timestamp'>
): StoredTestResult | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const newEntry: StoredTestResult = {
      ...data,
      id: generateId(),
      timestamp: Date.now(),
    };

    const current = getResults();
    const updated = [newEntry, ...current]; // Newest first

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch {
    return null;
  }
}

/**
 * Safely clears all stored test results from localStorage.
 */
export function clearResults(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage quota/access errors
  }
}
