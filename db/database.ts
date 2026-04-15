import AsyncStorage from '@react-native-async-storage/async-storage';
import { CFATopic, Question } from '../types';
import { SEED_QUESTIONS } from '../data/questions';

const QUESTIONS_KEY = 'chartis:questions';

let cache: Question[] | null = null;

async function loadQuestions(): Promise<Question[]> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(QUESTIONS_KEY);
  if (raw) {
    cache = JSON.parse(raw) as Question[];
    return cache;
  }
  // First launch — seed from static data
  cache = SEED_QUESTIONS;
  await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(cache));
  return cache;
}

export async function openDatabase(): Promise<void> {
  await loadQuestions();
}

export async function getQuestionsByTopic(topic: CFATopic): Promise<Question[]> {
  const questions = await loadQuestions();
  return questions
    .filter((q) => q.topic === topic)
    .sort((a, b) => a.difficulty - b.difficulty);
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const questions = await loadQuestions();
  return questions.find((q) => q.id === id) ?? null;
}

export async function getRandomQuestions(
  count: number,
  excludeIds: string[] = []
): Promise<Question[]> {
  const questions = await loadQuestions();
  const pool = excludeIds.length > 0
    ? questions.filter((q) => !excludeIds.includes(q.id))
    : questions;
  // Fisher-Yates shuffle, take first `count`
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function getQuestionsByDifficulty(difficulty: 1 | 2 | 3): Promise<Question[]> {
  const questions = await loadQuestions();
  const filtered = questions.filter((q) => q.difficulty === difficulty);
  // Shuffle in place
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }
  return filtered;
}

export async function getQuestionCountByTopic(): Promise<Record<string, number>> {
  const questions = await loadQuestions();
  const counts: Record<string, number> = {};
  for (const q of questions) {
    counts[q.topic] = (counts[q.topic] ?? 0) + 1;
  }
  return counts;
}
