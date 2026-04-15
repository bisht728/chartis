import { useEffect, useState } from 'react';
import { CFATopic, Question } from '../types';
import {
  getQuestionsByTopic,
  getRandomQuestions,
  getQuestionsByDifficulty,
} from '../db/database';

export function useTopicQuestions(topic: CFATopic) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getQuestionsByTopic(topic)
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [topic]);

  return { questions, loading };
}

export function useRandomQuestions(count: number, excludeIds: string[] = []) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRandomQuestions(count, excludeIds)
      .then(setQuestions)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return { questions, loading };
}

export function useDifficultyQuestions(difficulty: 1 | 2 | 3) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getQuestionsByDifficulty(difficulty)
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [difficulty]);

  return { questions, loading };
}
