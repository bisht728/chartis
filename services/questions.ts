import { supabase } from '@/lib/supabase';
import { AnswerKey, CFATopic, Difficulty, Question } from '@/types';

// Shape of a row in the Supabase questions table
interface SupabaseQuestion {
  id: number;
  qualification: string;
  level: number;
  topic: string;
  module: string;
  module_number: number;
  type: 'fundamental' | 'applied';
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

export interface QuestionFilters {
  topic?: string;
  module?: string;
  type?: 'fundamental' | 'applied';
  difficulty?: 'easy' | 'medium' | 'hard';
}

const DIFFICULTY_MAP: Record<'easy' | 'medium' | 'hard', Difficulty> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function mapRow(row: SupabaseQuestion): Question {
  return {
    id: String(row.id),
    topic: row.topic as CFATopic,
    subtopic: row.module,
    los: `M${row.module_number}`,
    difficulty: DIFFICULTY_MAP[row.difficulty],
    text: row.question_text,
    choices: {
      A: row.option_a,
      B: row.option_b,
      C: row.option_c,
      D: row.option_d,
    },
    correctAnswer: row.correct_answer as AnswerKey,
    hint: '',
    explanation: row.explanation,
  };
}

export async function fetchQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  let query = supabase.from('questions').select('*');

  if (filters.topic)      query = query.eq('topic', filters.topic);
  if (filters.module)     query = query.eq('module', filters.module);
  if (filters.type)       query = query.eq('type', filters.type);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as SupabaseQuestion[]).map(mapRow);
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRow(data as SupabaseQuestion);
}

export async function fetchQuestionCountByTopic(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('questions').select('topic');
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data as { topic: string }[]) {
    counts[row.topic] = (counts[row.topic] ?? 0) + 1;
  }
  return counts;
}
