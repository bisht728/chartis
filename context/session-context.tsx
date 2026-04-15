import React, { createContext, useContext, useState } from 'react';
import { AnswerKey, CFATopic, StudySession } from '../types';

interface SessionContextValue {
  session: StudySession | null;
  startSession: (questionIds: string[], topicFilter: CFATopic | null) => void;
  recordAnswer: (questionId: string, answer: AnswerKey) => void;
  advanceQuestion: () => void;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);

  const startSession = (questionIds: string[], topicFilter: CFATopic | null) => {
    setSession({
      questionIds,
      currentIndex: 0,
      answers: {},
      startedAt: new Date().toISOString(),
      topicFilter,
    });
  };

  const recordAnswer = (questionId: string, answer: AnswerKey) => {
    setSession((prev) =>
      prev ? { ...prev, answers: { ...prev.answers, [questionId]: answer } } : prev
    );
  };

  const advanceQuestion = () => {
    setSession((prev) =>
      prev && prev.currentIndex < prev.questionIds.length - 1
        ? { ...prev, currentIndex: prev.currentIndex + 1 }
        : prev
    );
  };

  const endSession = () => setSession(null);

  return (
    <SessionContext.Provider value={{ session, startSession, recordAnswer, advanceQuestion, endSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
