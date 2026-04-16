import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/ui/answer-option';
import { CFAColors, Theme } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { useThemeContext } from '@/context/theme-context';
import { useStreak } from '@/hooks/use-streak';
import { getRandomQuestions } from '@/db/database';
import { fetchQuestions, QuestionFilters } from '@/services/questions';
import { AnswerKey, CFATopic, Question } from '@/types';
import { TOPIC_METADATA } from '@/data/topics';

const DEFAULT_SESSION_SIZE = 10;

export default function SessionScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { topic, module: moduleParam, difficulty, type, size } =
    useLocalSearchParams<{
      topic?: string;
      module?: string;
      difficulty?: string;
      type?: string;
      size?: string;
    }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wrongExpanded, setWrongExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { recordAttempt } = useProgressContext();
  const { recordStudySession } = useStreak();

  useEffect(() => {
    const sessionSize = size ? parseInt(size, 10) : DEFAULT_SESSION_SIZE;

    let load: Promise<Question[]>;
    if (topic) {
      const filters: QuestionFilters = { topic };
      if (moduleParam) filters.module     = moduleParam;
      if (difficulty)  filters.difficulty = difficulty as QuestionFilters['difficulty'];
      if (type)        filters.type       = type as QuestionFilters['type'];
      load = fetchQuestions(filters);
    } else {
      load = getRandomQuestions(sessionSize);
    }

    load.then((qs) => {
      // Shuffle so the same filters don't always give the same order
      const shuffled = [...qs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQuestions(shuffled.slice(0, sessionSize));
      setLoading(false);
    });
  }, [topic, moduleParam, difficulty, type, size]);

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
      setWrongExpanded(false);
      fadeAnim.setValue(0);
    }
  }

  function handleToggleWrongExp() {
    if (!wrongExpanded) {
      setWrongExpanded(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
        setWrongExpanded(false)
      );
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.gold} />
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
            color: accuracy >= 70 ? theme.correct : accuracy >= 50 ? theme.gold : theme.incorrect,
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

  const topicColor = topicMeta ? CFAColors.topic[topicMeta.colorKey] : theme.gold;

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

        {/* Why was my answer wrong? */}
        {revealed &&
          selectedAnswer !== null &&
          selectedAnswer !== currentQuestion.correctAnswer &&
          currentQuestion.wrongAnswerExplanations[selectedAnswer] != null && (
            <>
              <Pressable style={styles.wrongExpBtn} onPress={handleToggleWrongExp}>
                <Text style={styles.wrongExpBtnText}>
                  Why is {selectedAnswer} wrong?
                </Text>
                <Text style={styles.wrongExpChevron}>{wrongExpanded ? '▲' : '▼'}</Text>
              </Pressable>

              {wrongExpanded && (
                <Animated.View style={[styles.wrongExpCard, { opacity: fadeAnim }]}>
                  <Text style={styles.wrongExpLabel}>Option {selectedAnswer}</Text>
                  <Text style={styles.wrongExpText}>
                    {currentQuestion.wrongAnswerExplanations[selectedAnswer]}
                  </Text>
                </Animated.View>
              )}
            </>
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

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 20, paddingBottom: 48 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topicBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
    topicBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
    counter: { fontSize: 13, color: t.textSecondary, fontWeight: '600' },
    progressTrack: { height: 3, backgroundColor: t.border, borderRadius: 2, overflow: 'hidden', marginTop: -8 },
    progressFill: { height: 3, backgroundColor: t.gold, borderRadius: 2 },
    questionText: { fontSize: 16, lineHeight: 26, color: t.text, fontWeight: '400' },
    options: { gap: 10 },
    explanationBox: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 16, gap: 8 },
    explanationTitle: { fontSize: 11, fontWeight: '700', color: t.gold, textTransform: 'uppercase', letterSpacing: 1 },
    explanationText: { fontSize: 14, lineHeight: 22, color: t.textSecondary },
    wrongExpBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1, borderColor: '#C9A84C44', borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 13, backgroundColor: t.card,
    },
    wrongExpBtnText: { fontSize: 14, fontWeight: '600', color: '#C9A84C' },
    wrongExpChevron: { fontSize: 11, color: '#C9A84C' },
    wrongExpCard: {
      backgroundColor: '#1e1800', borderLeftWidth: 3, borderLeftColor: '#C9A84C',
      borderWidth: 1, borderColor: '#C9A84C33', borderRadius: 12,
      padding: 16, gap: 6,
    },
    wrongExpLabel: { fontSize: 11, fontWeight: '700', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1 },
    wrongExpText: { fontSize: 14, lineHeight: 22, color: '#d4b87a' },
    goldBtn: { backgroundColor: t.gold, borderRadius: 14, paddingVertical: 17, alignItems: 'center' },
    goldBtnText: { color: '#0d0f14', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
    emptyText: { fontSize: 16, color: t.textSecondary, textAlign: 'center' },
    backBtn: { padding: 14, borderRadius: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    backBtnText: { fontSize: 15, fontWeight: '600', color: t.text },
    done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
    doneEmoji: { fontSize: 48, color: t.correct, fontWeight: '800' },
    doneTitle: { fontSize: 26, fontWeight: '800', color: t.text },
    doneScore: { fontSize: 40, fontWeight: '800', color: t.text },
    doneAccuracy: { fontSize: 18, fontWeight: '600' },
  });
}
