import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AnswerKey, CFATopic, QuestionAttempt, UserProgress } from '../types';
import { loadProgress, saveProgress } from '../storage/progress-storage';

// --- Actions ---

type Action =
  | { type: 'LOAD'; payload: UserProgress }
  | { type: 'RECORD_ATTEMPT'; payload: { attempt: QuestionAttempt; topic: CFATopic } }
  | { type: 'RESET' };

// --- Reducer ---

function reducer(state: UserProgress, action: Action): UserProgress {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'RECORD_ATTEMPT': {
      const { attempt, topic } = action.payload;
      const existing = state.topicProgress[topic] ?? {
        topic,
        totalAttempted: 0,
        totalCorrect: 0,
        accuracyPercent: 0,
        lastAttemptedAt: null,
      };
      const totalAttempted = existing.totalAttempted + 1;
      const totalCorrect = existing.totalCorrect + (attempt.isCorrect ? 1 : 0);
      const updatedTopicProgress = {
        ...state.topicProgress,
        [topic]: {
          topic,
          totalAttempted,
          totalCorrect,
          accuracyPercent: Math.round((totalCorrect / totalAttempted) * 100),
          lastAttemptedAt: attempt.attemptedAt,
        },
      };
      const questionsSeenIds = state.questionsSeenIds.includes(attempt.questionId)
        ? state.questionsSeenIds
        : [...state.questionsSeenIds, attempt.questionId];
      return {
        attempts: [...state.attempts, attempt],
        topicProgress: updatedTopicProgress,
        questionsSeenIds,
      };
    }

    case 'RESET':
      return { attempts: [], topicProgress: {}, questionsSeenIds: [] };

    default:
      return state;
  }
}

// --- Context ---

const initialState: UserProgress = {
  attempts: [],
  topicProgress: {},
  questionsSeenIds: [],
};

interface ProgressContextValue {
  state: UserProgress;
  recordAttempt: (attempt: QuestionAttempt, topic: CFATopic) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadProgress().then((saved) => dispatch({ type: 'LOAD', payload: saved }));
  }, []);

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const recordAttempt = (attempt: QuestionAttempt, topic: CFATopic) =>
    dispatch({ type: 'RECORD_ATTEMPT', payload: { attempt, topic } });

  const reset = () => dispatch({ type: 'RESET' });

  return (
    <ProgressContext.Provider value={{ state, recordAttempt, reset }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgressContext must be used within ProgressProvider');
  return ctx;
}
