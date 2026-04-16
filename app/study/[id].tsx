import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/ui/answer-option';
import { Theme } from '@/constants/theme';
import { useThemeContext } from '@/context/theme-context';
import { getQuestionById } from '@/db/database';
import { AnswerKey, Question } from '@/types';

export default function QuestionReviewScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { id, selected } = useLocalSearchParams<{ id: string; selected: AnswerKey }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getQuestionById(id).then(setQuestion).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.gold} />
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

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 16, paddingBottom: 40 },
    questionText: { fontSize: 16, lineHeight: 26, color: t.text, fontWeight: '400' },
    options: { gap: 10 },
    hintBox: {
      backgroundColor: t.goldDim, borderWidth: 1,
      borderColor: t.gold + '44', borderRadius: 12, padding: 14, gap: 6,
    },
    explanationBox: {
      backgroundColor: t.card, borderWidth: 1,
      borderColor: t.border, borderRadius: 12, padding: 16, gap: 8,
    },
    boxTitle: { fontSize: 11, fontWeight: '700', color: t.gold, textTransform: 'uppercase', letterSpacing: 1 },
    boxText: { fontSize: 14, lineHeight: 22, color: t.textSecondary },
    losRef: { fontSize: 12, color: t.textMuted, marginTop: 4 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 16, color: t.textSecondary },
  });
}
