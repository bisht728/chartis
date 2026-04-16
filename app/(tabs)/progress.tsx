import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ui/progress-ring';
import { CFAColors, Theme } from '@/constants/theme';
import { useThemeContext } from '@/context/theme-context';
import { useOverallStats } from '@/hooks/use-progress';
import { useProgressContext } from '@/context/progress-context';
import { useStreak } from '@/hooks/use-streak';
import { TOPIC_METADATA } from '@/data/topics';

export default function ProgressScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { state } = useProgressContext();
  const stats = useOverallStats();
  const { streak } = useStreak();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>

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
              color={theme.gold}
              trackColor={theme.border}
            />
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.gold }]}>{streak.currentStreak}🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>BY TOPIC</Text>
        <View style={styles.topicList}>
          {TOPIC_METADATA.map((meta) => {
            const tp = state.topicProgress[meta.id];
            const accuracy = tp?.accuracyPercent ?? 0;
            const attempted = tp?.totalAttempted ?? 0;
            const color = CFAColors.topic[meta.colorKey] ?? theme.gold;

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
                  trackColor={theme.border}
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

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 20, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: '800', color: t.text },

    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 14, padding: 16, alignItems: 'center', gap: 6,
    },
    statCardCenter: { paddingVertical: 12 },
    statValue: { fontSize: 28, fontWeight: '800', color: t.text },
    statLabel: { fontSize: 11, color: t.textSecondary, fontWeight: '600', textAlign: 'center' },

    sectionTitle: { fontSize: 12, fontWeight: '700', color: t.textSecondary, letterSpacing: 1.2, marginBottom: -8 },
    topicList: { gap: 8 },
    topicRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 12, padding: 14, gap: 12,
    },
    topicDot: { width: 10, height: 10, borderRadius: 5 },
    topicInfo: { flex: 1, gap: 2 },
    topicName: { fontSize: 15, fontWeight: '600', color: t.text },
    topicAttempted: { fontSize: 12, color: t.textSecondary },
  });
}
