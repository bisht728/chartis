import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ui/progress-ring';
import { DARK, CFAColors } from '@/constants/theme';
import { useOverallStats } from '@/hooks/use-progress';
import { useProgressContext } from '@/context/progress-context';
import { useStreak } from '@/hooks/use-streak';
import { TOPIC_METADATA } from '@/data/topics';

export default function ProgressScreen() {
  const { state } = useProgressContext();
  const stats = useOverallStats();
  const { streak } = useStreak();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>

        {/* Overall stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalAttempted}</Text>
            <Text style={styles.statLabel}>Answered</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <ProgressRing
              percent={stats.accuracyPercent}
              size={72}
              strokeWidth={7}
              color={DARK.gold}
              trackColor={DARK.border}
            />
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: DARK.gold }]}>{streak.currentStreak}🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Topic breakdown */}
        <Text style={styles.sectionTitle}>BY TOPIC</Text>
        <View style={styles.topicList}>
          {TOPIC_METADATA.map((meta) => {
            const tp = state.topicProgress[meta.id];
            const accuracy = tp?.accuracyPercent ?? 0;
            const attempted = tp?.totalAttempted ?? 0;
            const color = CFAColors.topic[meta.colorKey] ?? DARK.gold;

            return (
              <View key={meta.id} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: color }]} />
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{meta.shortName}</Text>
                  <Text style={styles.topicAttempted}>
                    {attempted === 0 ? 'Not started' : `${attempted} attempted`}
                  </Text>
                </View>
                <ProgressRing
                  percent={accuracy}
                  size={44}
                  strokeWidth={4}
                  color={color}
                  trackColor={DARK.border}
                  showLabel={attempted > 0}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: DARK.text },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statCardCenter: { paddingVertical: 12 },
  statValue: { fontSize: 28, fontWeight: '800', color: DARK.text },
  statLabel: { fontSize: 11, color: DARK.textSecondary, fontWeight: '600', textAlign: 'center' },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK.textSecondary,
    letterSpacing: 1.2,
    marginBottom: -8,
  },
  topicList: { gap: 8 },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  topicDot: { width: 10, height: 10, borderRadius: 5 },
  topicInfo: { flex: 1, gap: 2 },
  topicName: { fontSize: 15, fontWeight: '600', color: DARK.text },
  topicAttempted: { fontSize: 12, color: DARK.textSecondary },
});
