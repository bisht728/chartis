import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DARK, CFAColors } from '@/constants/theme';
import { useTopicQuestions } from '@/hooks/use-topic-questions';
import { TOPIC_METADATA } from '@/data/topics';
import { CFATopic } from '@/types';

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFFICULTY_COLOR: Record<number, string> = {
  1: '#22C55E',
  2: '#D97706',
  3: '#EF4444',
};

export default function TopicDetailScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { questions, loading } = useTopicQuestions(topic as CFATopic);
  const meta = TOPIC_METADATA.find((t) => t.id === topic);
  const topicColor = meta ? CFAColors.topic[meta.colorKey] : DARK.gold;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderLeftColor: topicColor }]}>
          <Text style={[styles.title, { color: topicColor }]}>{meta?.shortName ?? topic}</Text>
          <Text style={styles.subtitle}>{meta?.displayName ?? topic}</Text>
        </View>

        {/* Practice button */}
        <Pressable
          style={[styles.sessionBtn, { backgroundColor: topicColor }]}
          onPress={() => router.push({ pathname: '/study/session', params: { topic } })}
        >
          <Text style={styles.sessionBtnText}>
            Practice {meta?.shortName ?? 'Topic'} Questions
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>
          {loading ? 'Loading…' : `${questions.length} Questions`}
        </Text>

        {questions.map((q, i) => (
          <View key={q.id} style={styles.qCard}>
            <View style={styles.qMeta}>
              <Text style={styles.qNum}>Q{i + 1}</Text>
              <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLOR[q.difficulty] + '22', borderColor: DIFFICULTY_COLOR[q.difficulty] + '55' }]}>
                <Text style={[styles.diffText, { color: DIFFICULTY_COLOR[q.difficulty] }]}>
                  {DIFFICULTY_LABEL[q.difficulty]}
                </Text>
              </View>
              <Text style={styles.qLos}>LOS {q.los}</Text>
            </View>
            <Text style={styles.qText} numberOfLines={3}>{q.text}</Text>
          </View>
        ))}

        {!loading && questions.length === 0 && (
          <Text style={styles.empty}>No questions for this topic yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 16, paddingBottom: 40 },
  header: { borderLeftWidth: 3, paddingLeft: 12, gap: 3 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, color: DARK.textSecondary },
  sessionBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  sessionBtnText: { color: '#0d0f14', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: DARK.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  qCard: {
    backgroundColor: DARK.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK.border,
    padding: 14,
    gap: 8,
  },
  qMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { fontSize: 12, fontWeight: '700', color: DARK.textMuted },
  diffBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  diffText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  qLos: { fontSize: 11, color: DARK.textMuted },
  qText: { fontSize: 13, lineHeight: 20, color: DARK.textSecondary },
  empty: { fontSize: 15, color: DARK.textMuted, textAlign: 'center', marginTop: 20 },
});
