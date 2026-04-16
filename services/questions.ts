import { TOPIC_METADATA } from '@/data/topics';
import { supabase } from '@/lib/supabase';
import { AnswerKey, CFATopic, Difficulty, Question } from '@/types';

// Maps between the exact Supabase topic strings and the internal CFATopic enum values
const SUPABASE_TO_CFTOPIC = Object.fromEntries(
  TOPIC_METADATA.map((t) => [t.supabaseName, t.id])
) as Record<string, CFATopic>;

const CFTOPIC_TO_SUPABASE = Object.fromEntries(
  TOPIC_METADATA.map((t) => [t.id, t.supabaseName])
) as Record<string, string>;

// Shape of a row in the Supabase questions table
interface SupabaseQuestion {
  id: number;
  qualification: string;
  level: string;
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
  wrong_answer_explanations: Partial<Record<string, string>> | null;
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
    topic: SUPABASE_TO_CFTOPIC[row.topic] ?? (row.topic as CFATopic),
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
    wrongAnswerExplanations: (row.wrong_answer_explanations ?? {}) as Partial<Record<AnswerKey, string>>,
  };
}

export async function fetchQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  let query = supabase
    .from('questions')
    .select('*, wrong_answer_explanations')
    .eq('qualification', 'CFA')
    .eq('level', 'Level 1');

  if (filters.topic)      query = query.eq('topic', CFTOPIC_TO_SUPABASE[filters.topic] ?? filters.topic);
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
    .select('*, wrong_answer_explanations')
    .eq('qualification', 'CFA')
    .eq('level', 'Level 1')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRow(data as SupabaseQuestion);
}

export async function fetchModulesForTopic(topic: string): Promise<string[]> {
  const supabaseTopic = CFTOPIC_TO_SUPABASE[topic] ?? topic;
  const { data, error } = await supabase
    .from('questions')
    .select('module, module_number')
    .eq('qualification', 'CFA')
    .eq('level', 'Level 1')
    .eq('topic', supabaseTopic)
    .order('module_number');

  if (error) throw new Error(error.message);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const modules: string[] = [];
  for (const row of data as { module: string }[]) {
    if (!seen.has(row.module)) {
      seen.add(row.module);
      modules.push(row.module);
    }
  }
  return modules;
}

export async function fetchFilteredCount(filters: QuestionFilters): Promise<number> {
  let query = supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('qualification', 'CFA')
    .eq('level', 'Level 1');

  if (filters.topic)      query = query.eq('topic', CFTOPIC_TO_SUPABASE[filters.topic] ?? filters.topic);
  if (filters.module)     query = query.eq('module', filters.module);
  if (filters.type)       query = query.eq('type', filters.type);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fetchQuestionCountByTopic(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('questions')
    .select('topic')
    .eq('qualification', 'CFA')
    .eq('level', 'Level 1');
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data as { topic: string }[]) {
    // Translate Supabase short name → CFATopic enum value so callers can look up by topic.id
    const key = SUPABASE_TO_CFTOPIC[row.topic] ?? row.topic;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
