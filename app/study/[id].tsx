import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/ui/answer-option';
import { DARK } from '@/constants/theme';
import { getQuestionById } from '@/db/database';
import { AnswerKey, Question } from '@/types';

export default function QuestionReviewScreen() {
  const { id, selected } = useLocalSearchParams<{ id: string; selected: AnswerKey }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getQuestionById(id).then(setQuestion).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={DARK.gold} />
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Question not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.options}>
          {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((key) => {
            let state: 'idle' | 'selected' | 'correct' | 'incorrect' = 'idle';
            if (key === question.correctAnswer) state = 'correct';
            else if (key === selected) state = 'incorrect';
            return (
              <AnswerOption key={key} answerKey={key} text={question.choices[key]} state={state} disabled />
            );
          })}
        </View>

        <View style={styles.hintBox}>
          <Text style={styles.boxTitle}>Hint</Text>
          <Text style={styles.boxText}>{question.hint}</Text>
        </View>

        <View style={styles.explanationBox}>
          <Text style={styles.boxTitle}>Full Explanation</Text>
          <Text style={styles.boxText}>{question.explanation}</Text>
          <Text style={styles.losRef}>LOS {question.los}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 16, paddingBottom: 40 },
  questionText: { fontSize: 16, lineHeight: 26, color: DARK.text, fontWeight: '400' },
  options: { gap: 10 },
  hintBox: {
    backgroundColor: DARK.goldDim,
    borderWidth: 1,
    borderColor: DARK.gold + '44',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  explanationBox: {
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  boxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  boxText: { fontSize: 14, lineHeight: 22, color: DARK.textSecondary },
  losRef: { fontSize: 12, color: DARK.textMuted, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: DARK.textSecondary },
});
