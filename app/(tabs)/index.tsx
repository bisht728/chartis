import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartisLogo } from '@/components/chartis-logo';
import { ProgressRing } from '@/components/ui/progress-ring';
import { DARK, CFAColors } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { useOverallStats } from '@/hooks/use-progress';
import { useStreak } from '@/hooks/use-streak';
import { TOPIC_METADATA } from '@/data/topics';
import { CFATopic } from '@/types';

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
})();

// Show a curated subset on dashboard
const DASHBOARD_TOPICS = [
  CFATopic.Quantitative,
  CFATopic.Economics,
  CFATopic.FinancialReporting,
  CFATopic.Equity,
];

export default function DashboardScreen() {
  const { state } = useProgressContext();
  const { streak } = useStreak();
  const stats = useOverallStats();

  // Find the topic with most recent activity for "Continue" card
  const lastAttempt = state.attempts[state.attempts.length - 1];
  const continueTopic = lastAttempt
    ? TOPIC_METADATA.find((t) => t.id === lastAttempt.questionId.split('-')[0])
      ?? TOPIC_METADATA.find((t) => t.id === CFATopic.FixedIncome)
    : TOPIC_METADATA.find((t) => t.id === CFATopic.FixedIncome);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{GREETING}</Text>
            <ChartisLogo size="lg" />
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CG</Text>
          </View>
        </View>

        {/* Streak card */}
        <Pressable
          style={styles.streakCard}
          onPress={() => router.push('/(tabs)/progress')}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakNum}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <Text style={styles.streakFire}>🔥</Text>
        </Pressable>

        {/* Continue card */}
        {continueTopic && (
          <Pressable
            style={styles.continueCard}
            onPress={() =>
              router.push({ pathname: '/study/session', params: { topic: continueTopic.id } })
            }
          >
            <View style={styles.continueLeft}>
              <Text style={styles.continueLabel}>Continue</Text>
              <Text style={styles.continueTopic}>{continueTopic.displayName}</Text>
            </View>
            <View style={styles.continueArrow}>
              <Text style={styles.continueArrowText}>›</Text>
            </View>
          </Pressable>
        )}

        {/* Topics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TOPICS</Text>
          <Pressable onPress={() => router.push('/(tabs)/topics')}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.topicsGrid}>
          {DASHBOARD_TOPICS.map((topicId) => {
            const meta = TOPIC_METADATA.find((t) => t.id === topicId)!;
            const tp = state.topicProgress[topicId];
            const pct = tp?.accuracyPercent ?? 0;
            const topicColor = CFAColors.topic[meta.colorKey] ?? DARK.gold;

            return (
              <Pressable
                key={topicId}
                style={styles.topicCard}
                onPress={() =>
                  router.push({ pathname: '/topics/[topic]', params: { topic: topicId } })
                }
              >
                <View style={[styles.topicIconDot, { backgroundColor: topicColor + '33', borderColor: topicColor + '55' }]}>
                  <Text style={[styles.topicIconText, { color: topicColor }]}>
                    {meta.shortName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.topicCardBottom}>
                  <Text style={styles.topicCardName} numberOfLines={2}>{meta.shortName}</Text>
                  <Text style={[styles.topicCardPct, { color: pct > 0 ? DARK.gold : DARK.textMuted }]}>
                    {pct > 0 ? `${pct}%` : '—'}
                  </Text>
                </View>
                <View style={styles.topicRingWrap}>
                  <ProgressRing
                    percent={pct}
                    size={36}
                    strokeWidth={4}
                    color={topicColor}
                    trackColor={DARK.border}
                    showLabel={false}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Quick start */}
        <Pressable
          style={styles.startBtn}
          onPress={() => router.push('/study/session')}
        >
          <Text style={styles.startBtnText}>Start Practice Session</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 18, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { gap: 4 },
  greeting: { fontSize: 13, color: DARK.textSecondary, fontWeight: '500' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DARK.goldDim,
    borderWidth: 1.5,
    borderColor: DARK.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: DARK.gold, fontSize: 14, fontWeight: '700' },

  streakCard: {
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: { gap: 2 },
  streakNum: {
    fontSize: 48,
    fontWeight: '800',
    color: DARK.text,
    lineHeight: 54,
  },
  streakLabel: { fontSize: 14, color: DARK.textSecondary, fontWeight: '500' },
  streakFire: { fontSize: 40 },

  continueCard: {
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueLeft: { gap: 3 },
  continueLabel: { fontSize: 11, color: DARK.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  continueTopic: { fontSize: 17, color: DARK.text, fontWeight: '700' },
  continueArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DARK.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueArrowText: { color: DARK.gold, fontSize: 22, fontWeight: '600', marginTop: -2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -6,
  },
  sectionTitle: { fontSize: 12, color: DARK.textSecondary, fontWeight: '700', letterSpacing: 1.2 },
  sectionLink: { fontSize: 13, color: DARK.gold, fontWeight: '600' },

  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  topicCard: {
    width: '47%',
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  topicIconDot: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIconText: { fontSize: 12, fontWeight: '800' },
  topicCardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  topicCardName: {
    fontSize: 13,
    color: DARK.text,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  topicCardPct: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  topicRingWrap: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },

  startBtn: {
    backgroundColor: DARK.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnText: {
    color: '#0d0f14',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
