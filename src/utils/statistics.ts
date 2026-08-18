import type { StoredTestResult, UserStatistics, TestDuration } from '../types';

/**
 * Pure function — calculates aggregated user statistics from test history.
 * Guarantees zero NaN / Infinity / undefined outputs.
 */
export function calculateStatistics(results: StoredTestResult[]): UserStatistics {
  if (!results || results.length === 0) {
    return {
      testsCompleted: 0,
      personalBestWpm: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      best15sWpm: 0,
      best30sWpm: 0,
      best60sWpm: 0,
    };
  }

  const testsCompleted = results.length;
  let totalWpm = 0;
  let totalAccuracy = 0;
  let personalBestWpm = 0;
  let best15sWpm = 0;
  let best30sWpm = 0;
  let best60sWpm = 0;

  for (const r of results) {
    totalWpm += r.wpm;
    totalAccuracy += r.accuracy;

    if (r.wpm > personalBestWpm) {
      personalBestWpm = r.wpm;
    }

    if (r.duration === 15 && r.wpm > best15sWpm) {
      best15sWpm = r.wpm;
    } else if (r.duration === 30 && r.wpm > best30sWpm) {
      best30sWpm = r.wpm;
    } else if (r.duration === 60 && r.wpm > best60sWpm) {
      best60sWpm = r.wpm;
    }
  }

  const averageWpm = Math.round(totalWpm / testsCompleted);
  const averageAccuracy = Math.round(totalAccuracy / testsCompleted);

  return {
    testsCompleted,
    personalBestWpm: Number.isFinite(personalBestWpm) ? personalBestWpm : 0,
    averageWpm: Number.isFinite(averageWpm) ? averageWpm : 0,
    averageAccuracy: Number.isFinite(averageAccuracy) ? averageAccuracy : 0,
    best15sWpm: Number.isFinite(best15sWpm) ? best15sWpm : 0,
    best30sWpm: Number.isFinite(best30sWpm) ? best30sWpm : 0,
    best60sWpm: Number.isFinite(best60sWpm) ? best60sWpm : 0,
  };
}

/**
 * Pure function — determines if a newly completed test result is a Personal Best.
 * Note: priorHistory must NOT include the current result being evaluated.
 */
export function checkIsPersonalBest(
  currentWpm: number,
  duration: TestDuration,
  priorHistory: StoredTestResult[]
): { isOverallPb: boolean; isModePb: boolean } {
  if (currentWpm <= 0) {
    return { isOverallPb: false, isModePb: false };
  }

  if (priorHistory.length === 0) {
    return { isOverallPb: true, isModePb: true };
  }

  let priorOverallMax = 0;
  let priorModeMax = 0;
  let hasPriorModeTest = false;

  for (const r of priorHistory) {
    if (r.wpm > priorOverallMax) {
      priorOverallMax = r.wpm;
    }
    if (r.duration === duration) {
      hasPriorModeTest = true;
      if (r.wpm > priorModeMax) {
        priorModeMax = r.wpm;
      }
    }
  }

  const isOverallPb = currentWpm > priorOverallMax;
  const isModePb = !hasPriorModeTest || currentWpm > priorModeMax;

  return { isOverallPb, isModePb };
}
