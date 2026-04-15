import { useCallback, useEffect, useState } from 'react';
import { DailyStreak } from '../types';
import { loadStreak, saveStreak } from '../storage/progress-storage';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

export function useStreak() {
  const [streak, setStreak] = useState<DailyStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudiedDate: null,
    studiedDates: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadStreak().then((s) => {
      setStreak(s);
      setLoaded(true);
    });
  }, []);

  const recordStudySession = useCallback(async () => {
    const today = todayStr();
    setStreak((prev) => {
      if (prev.lastStudiedDate === today) return prev; // already recorded

      let newCurrent: number;
      if (prev.lastStudiedDate === yesterdayStr()) {
        newCurrent = prev.currentStreak + 1;
      } else {
        newCurrent = 1; // streak broken or first day
      }

      const updated: DailyStreak = {
        currentStreak: newCurrent,
        bestStreak: Math.max(prev.bestStreak, newCurrent),
        lastStudiedDate: today,
        studiedDates: [...prev.studiedDates, today],
      };
      saveStreak(updated);
      return updated;
    });
  }, []);

  return { streak, recordStudySession, loaded };
}
