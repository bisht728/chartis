import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/ui/answer-option';
import { DARK, CFAColors } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { useStreak } from '@/hooks/use-streak';
import { getRandomQuestions, getQuestionsByTopic } from '@/db/database';
import { AnswerKey, CFATopic, Question } from '@/types';
import { TOPIC_METADATA } from '@/data/topics';

const SESSION_SIZE = 10;

export default function SessionScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const { recordAttempt } = useProgressContext();
  const { recordStudySession } = useStreak();

  useEffect(() => {
    const load = topic
      ? getQuestionsByTopic(topic as CFATopic)
      : getRandomQuestions(SESSION_SIZE);
    load.then((qs) => {
      setQuestions(qs.slice(0, SESSION_SIZE));
      setLoading(false);
    });
  }, [topic]);

  const currentQuestion = questions[currentIndex] ?? null;
  const topicMeta = currentQuestion
    ? TOPIC_METADATA.find((t) => t.id === currentQuestion.topic)
    : null;

  function handleSelect(key: AnswerKey) {
    if (revealed || selectedAnswer) return;
    const isCorrect = key === currentQuestion!.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);
    recordAttempt(
      {
        questionId: currentQuestion!.id,
        selectedAnswer: key,
        isCorrect,
        attemptedAt: new Date().toISOString(),
      },
      currentQuestion!.topic
    );
    setSelectedAnswer(key);
    setRevealed(true);
  }

  function handleNext() {
    if (currentIndex >= questions.length - 1) {
      recordStudySession();
      setSessionDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={DARK.gold} />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No questions available yet.</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionDone) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.done}>
          <Text style={styles.doneEmoji}>✓</Text>
          <Text style={styles.doneTitle}>Session Complete</Text>
          <Text style={styles.doneScore}>{score} / {questions.length}</Text>
          <Text style={[styles.doneAccuracy, {
            color: accuracy >= 70 ? DARK.correct : accuracy >= 50 ? DARK.gold : DARK.incorrect,
          }]}>
            {accuracy}% accuracy
          </Text>
          <Pressable style={styles.goldBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.goldBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const topicColor = topicMeta ? CFAColors.topic[topicMeta.colorKey] : DARK.gold;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top row: topic badge + counter */}
        <View style={styles.topRow}>
          <View style={[styles.topicBadge, { backgroundColor: topicColor + '22', borderColor: topicColor + '55' }]}>
            <Text style={[styles.topicBadgeText, { color: topicColor }]}>
              {topicMeta?.shortName.toUpperCase() ?? 'PRACTICE'}
            </Text>
          </View>
          <Text style={styles.counter}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question text */}
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {/* Answer options */}
        <View style={styles.options}>
          {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((key) => {
            let state: 'idle' | 'selected' | 'correct' | 'incorrect' = 'idle';
            if (revealed) {
              if (key === currentQuestion.correctAnswer) state = 'correct';
              else if (key === selectedAnswer) state = 'incorrect';
            } else if (key === selectedAnswer) {
              state = 'selected';
            }
            return (
              <AnswerOption
                key={key}
                answerKey={key}
                text={currentQuestion.choices[key]}
                state={state}
                onPress={() => handleSelect(key)}
                disabled={revealed}
              />
            );
          })}
        </View>

        {/* Explanation (shown after reveal) */}
        {revealed && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        {/* Next button */}
        {revealed && (
          <Pressable style={styles.goldBtn} onPress={handleNext}>
            <Text style={styles.goldBtnText}>
              {currentIndex >= questions.length - 1 ? 'Finish Session' : 'Next Question →'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 20, paddingBottom: 48 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  counter: {
    fontSize: 13,
    color: DARK.textSecondary,
    fontWeight: '600',
  },

  progressTrack: {
    height: 3,
    backgroundColor: DARK.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: -8,
  },
  progressFill: {
    height: 3,
    backgroundColor: DARK.gold,
    borderRadius: 2,
  },

  questionText: {
    fontSize: 16,
    lineHeight: 26,
    color: DARK.text,
    fontWeight: '400',
  },

  options: { gap: 10 },

  explanationBox: {
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: DARK.textSecondary,
  },

  goldBtn: {
    backgroundColor: DARK.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  goldBtnText: {
    color: '#0d0f14',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  emptyText: { fontSize: 16, color: DARK.textSecondary, textAlign: 'center' },
  backBtn: { padding: 14, borderRadius: 12, backgroundColor: DARK.card, borderWidth: 1, borderColor: DARK.border },
  backBtnText: { fontSize: 15, fontWeight: '600', color: DARK.text },

  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  doneEmoji: { fontSize: 48, color: DARK.correct, fontWeight: '800' },
  doneTitle: { fontSize: 26, fontWeight: '800', color: DARK.text },
  doneScore: { fontSize: 40, fontWeight: '800', color: DARK.text },
  doneAccuracy: { fontSize: 18, fontWeight: '600' },
});
