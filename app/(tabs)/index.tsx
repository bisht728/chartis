import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartisLogo } from '@/components/chartis-logo';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CFAColors, Theme } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { useThemeContext } from '@/context/theme-context';
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
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
          <View style={styles.streakDivider} />
          <View style={styles.streakStats}>
            <View style={styles.streakStatItem}>
              <Text style={styles.streakStatValue}>{stats.totalAttempted}</Text>
              <Text style={styles.streakStatLabel}>Answered</Text>
            </View>
            <View style={styles.streakStatItem}>
              <ProgressRing
                percent={stats.accuracyPercent}
                size={44}
                strokeWidth={5}
                color={theme.gold}
                trackColor={theme.border}
                showLabel={stats.totalAttempted > 0}
              />
              <Text style={styles.streakStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.streakStatItem}>
              <Text style={styles.streakStatValue}>{stats.topicsStudied}</Text>
              <Text style={styles.streakStatLabel}>Topics</Text>
            </View>
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
            const topicColor = CFAColors.topic[meta.colorKey] ?? theme.gold;

            return (
              <Pressable
                key={topicId}
                style={styles.topicCard}
                onPress={() =>
                  router.push({ pathname: '/topics/[topic]', params: { topic: topicId } })
                }
              >
                <View style={styles.topicCardTop}>
                  <View style={[styles.topicIconDot, { backgroundColor: topicColor + '33', borderColor: topicColor + '55' }]}>
                    <Text style={[styles.topicIconText, { color: topicColor }]}>
                      {meta.shortName.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <ProgressRing
                    percent={pct}
                    size={36}
                    strokeWidth={4}
                    color={topicColor}
                    trackColor={theme.border}
                    showLabel={pct > 0}
                  />
                </View>
                <Text style={styles.topicCardName} numberOfLines={2}>{meta.displayName}</Text>
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

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 18, paddingBottom: 40 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { gap: 4 },
    greeting: { fontSize: 13, color: t.textSecondary, fontWeight: '500' },
    avatar: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: t.goldDim, borderWidth: 1.5, borderColor: t.gold,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: t.gold, fontSize: 14, fontWeight: '700' },

    streakCard: {
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 16, padding: 20, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
    },
    streakLeft: { gap: 2 },
    streakNum: { fontSize: 42, fontWeight: '800', color: t.text, lineHeight: 48 },
    streakLabel: { fontSize: 13, color: t.textSecondary, fontWeight: '500' },
    streakFire: { fontSize: 32, alignSelf: 'flex-start' },
    streakDivider: { width: 1, height: '80%', backgroundColor: t.border, marginHorizontal: 4 },
    streakStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    streakStatItem: { alignItems: 'center', gap: 4 },
    streakStatValue: { fontSize: 22, fontWeight: '800', color: t.text },
    streakStatLabel: { fontSize: 10, color: t.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    continueCard: {
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 16, padding: 18, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
    },
    continueLeft: { gap: 3 },
    continueLabel: { fontSize: 11, color: t.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
    continueTopic: { fontSize: 17, color: t.text, fontWeight: '700' },
    continueArrow: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: t.goldDim, alignItems: 'center', justifyContent: 'center',
    },
    continueArrowText: { color: t.gold, fontSize: 22, fontWeight: '600', marginTop: -2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -6 },
    sectionTitle: { fontSize: 12, color: t.textSecondary, fontWeight: '700', letterSpacing: 1.2 },
    sectionLink: { fontSize: 13, color: t.gold, fontWeight: '600' },

    topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    topicCard: {
      width: '47%', backgroundColor: t.card, borderWidth: 1,
      borderColor: t.border, borderRadius: 14, padding: 14, gap: 12,
    },
    topicCardTop: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
    },
    topicIconDot: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    topicIconText: { fontSize: 12, fontWeight: '800' },
    topicCardName: { fontSize: 13, color: t.text, fontWeight: '600', lineHeight: 18 },

    startBtn: { backgroundColor: t.gold, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
    startBtnText: { color: '#0d0f14', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  });
}
