import { CFATopic, TopicProgress, UserProgress } from '../types';
import { useProgressContext } from '../context/progress-context';

export function useProgress() {
  const { state, recordAttempt, reset } = useProgressContext();
  return { progress: state, recordAttempt, reset };
}

export function useTopicProgress(topic: CFATopic): TopicProgress | null {
  const { state } = useProgressContext();
  return state.topicProgress[topic] ?? null;
}

export function useOverallStats(): {
  totalAttempted: number;
  totalCorrect: number;
  accuracyPercent: number;
  topicsStudied: number;
} {
  const { state } = useProgressContext();
  const totalAttempted = state.attempts.length;
  const totalCorrect = state.attempts.filter((a) => a.isCorrect).length;
  const accuracyPercent =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const topicsStudied = Object.keys(state.topicProgress).length;
  return { totalAttempted, totalCorrect, accuracyPercent, topicsStudied };
}
