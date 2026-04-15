import AsyncStorage from '@react-native-async-storage/async-storage';
import { CFATopic, DailyStreak, UserProgress } from '../types';

const PROGRESS_KEY = 'chartis:progress';
const STREAK_KEY = 'chartis:streak';

function defaultProgress(): UserProgress {
  return {
    attempts: [],
    topicProgress: {},
    questionsSeenIds: [],
  };
}

function defaultStreak(): DailyStreak {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastStudiedDate: null,
    studiedDates: [],
  };
}

// --- UserProgress ---

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as UserProgress;
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(defaultProgress()));
}

// --- DailyStreak ---

export async function loadStreak(): Promise<DailyStreak> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return defaultStreak();
    return JSON.parse(raw) as DailyStreak;
  } catch {
    return defaultStreak();
  }
}

export async function saveStreak(streak: DailyStreak): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

export async function resetStreak(): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(defaultStreak()));
}

// --- Helpers ---

export function computeTopicAccuracy(
  attempts: UserProgress['attempts'],
  topic: CFATopic
): { totalAttempted: number; totalCorrect: number; accuracyPercent: number } {
  const topicAttempts = attempts.filter((a) => {
    // We don't store topic on attempt directly — caller must pass pre-filtered
    return true;
  });
  void topicAttempts; // topic filtering happens in context reducer

  const relevant = attempts;
  const totalAttempted = relevant.length;
  const totalCorrect = relevant.filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 100)
    : 0;
  return { totalAttempted, totalCorrect, accuracyPercent };
}
