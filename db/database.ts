import { CFATopic, Question } from '../types';
import {
  fetchQuestionById,
  fetchQuestionCountByTopic,
  fetchQuestions,
} from '../services/questions';

const DIFFICULTY_TO_STRING = { 1: 'easy', 2: 'medium', 3: 'hard' } as const;

// No-op — Supabase client initialises lazily
export async function openDatabase(): Promise<void> {}

export async function getQuestionsByTopic(topic: CFATopic): Promise<Question[]> {
  return fetchQuestions({ topic });
}

export async function getQuestionById(id: string): Promise<Question | null> {
  return fetchQuestionById(id);
}

export async function getRandomQuestions(
  count: number,
  excludeIds: string[] = []
): Promise<Question[]> {
  const all = await fetchQuestions();
  const pool = excludeIds.length > 0 ? all.filter((q) => !excludeIds.includes(q.id)) : all;
  // Fisher-Yates shuffle, take first `count`
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function getQuestionsByDifficulty(difficulty: 1 | 2 | 3): Promise<Question[]> {
  return fetchQuestions({ difficulty: DIFFICULTY_TO_STRING[difficulty] });
}

export async function getQuestionCountByTopic(): Promise<Record<string, number>> {
  return fetchQuestionCountByTopic();
}
