import { useSessionContext } from '../context/session-context';
import { Question } from '../types';

export function useSession() {
  return useSessionContext();
}

export function useCurrentQuestion(questions: Question[]): Question | null {
  const { session } = useSessionContext();
  if (!session || questions.length === 0) return null;
  const id = session.questionIds[session.currentIndex];
  return questions.find((q) => q.id === id) ?? null;
}

export function useSessionProgress(): {
  current: number;
  total: number;
  percentComplete: number;
} {
  const { session } = useSessionContext();
  if (!session) return { current: 0, total: 0, percentComplete: 0 };
  const total = session.questionIds.length;
  const current = session.currentIndex + 1;
  return { current, total, percentComplete: Math.round((current / total) * 100) };
}
