export enum CFATopic {
  Ethics = 'Ethics',
  Quantitative = 'Quantitative Methods',
  Economics = 'Economics',
  FinancialReporting = 'Financial Reporting & Analysis',
  CorporateIssuers = 'Corporate Issuers',
  Equity = 'Equity Investments',
  FixedIncome = 'Fixed Income',
  Derivatives = 'Derivatives',
  AlternativeInvestments = 'Alternative Investments',
  PortfolioManagement = 'Portfolio Management',
}

export type AnswerKey = 'A' | 'B' | 'C' | 'D';
export type Difficulty = 1 | 2 | 3;

export interface Question {
  id: string;
  topic: CFATopic;
  subtopic: string;
  los: string;
  difficulty: Difficulty;
  text: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: AnswerKey;
  hint: string;
  explanation: string;
}

export interface TopicMeta {
  id: CFATopic;
  displayName: string;
  shortName: string;
  colorKey: string;
  iconName: string;
  questionCount: number;
}

export interface QuestionAttempt {
  questionId: string;
  selectedAnswer: AnswerKey;
  isCorrect: boolean;
  attemptedAt: string;
}

export interface TopicProgress {
  topic: CFATopic;
  totalAttempted: number;
  totalCorrect: number;
  accuracyPercent: number;
  lastAttemptedAt: string | null;
}

export interface UserProgress {
  attempts: QuestionAttempt[];
  topicProgress: Partial<Record<CFATopic, TopicProgress>>;
  questionsSeenIds: string[];
}

export interface DailyStreak {
  currentStreak: number;
  bestStreak: number;
  lastStudiedDate: string | null;
  studiedDates: string[];
}

export interface StudySession {
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, AnswerKey>;
  startedAt: string;
  topicFilter: CFATopic | null;
}
