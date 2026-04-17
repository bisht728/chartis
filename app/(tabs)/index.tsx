import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { CFATopic, TopicProgress } from '@/types';

// ─── Utility functions ────────────────────────────────────────────────────────

// Time-of-day greeting — evaluated once at module load
const GREETING_PREFIX = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
})();

// Default topics shown when the user has no activity yet
const DEFAULT_TOPIC_IDS: CFATopic[] = [
  CFATopic.Quantitative,
  CFATopic.Economics,
  CFATopic.FinancialReporting,
  CFATopic.Equity,
];

// Streak milestones — progress bar advances toward the next one
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 200, 365];

function nextStreakMilestone(current: number): number {
  return STREAK_MILESTONES.find((m) => m > current) ?? current + 7;
}

// Returns how far (0–100) the user is between the previous and next milestone
function streakMilestonePct(current: number): number {
  const next = nextStreakMilestone(current);
  const idx = STREAK_MILESTONES.indexOf(next);
  const prev = idx > 0 ? STREAK_MILESTONES[idx - 1] : 0;
  const range = next - prev;
  return range > 0 ? Math.round(((current - prev) / range) * 100) : 100;
}

// Contextual label beneath the accuracy percentage
function accuracyLabel(pct: number): string {
  if (pct === 0) return 'No data yet';
  if (pct < 40) return 'Needs improvement';
  if (pct < 70) return 'Good progress';
  return 'Excellent';
}

// Rule-based insight nudge — picks the most relevant one-sentence prompt
function getInsightMessage(stats: {
  totalAttempted: number;
  accuracyPercent: number;
  topicsStudied: number;
  currentStreak: number;
}): string {
  const { totalAttempted, accuracyPercent, topicsStudied, currentStreak } = stats;
  if (totalAttempted === 0)
    return 'Complete your first practice session to start building your CFA foundation.';
  if (accuracyPercent < 40 && totalAttempted >= 5)
    return 'Accuracy below 40% — revisit the fundamentals before branching into new topics.';
  if (currentStreak === 0)
    return 'No active streak — even a short session today keeps your momentum going.';
  if (topicsStudied >= 5 && totalAttempted < 30)
    return 'Good breadth — try going deeper on one topic to lock in the concepts.';
  if (accuracyPercent >= 70 && totalAttempted >= 20)
    return 'Strong accuracy — consider raising difficulty to sharpen exam readiness.';
  return 'Consistency beats intensity — short daily sessions outperform weekend cramming.';
}

// Short status string shown beneath each topic name in the grid
function topicStatus(tp: TopicProgress | undefined): string {
  if (!tp || tp.totalAttempted === 0) return 'Not started';
  return `In progress · ${tp.accuracyPercent}% accuracy`;
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { state } = useProgressContext();
  const { streak } = useStreak();
  const stats = useOverallStats();

  // Load first name from local profile store (chartis:profile → { displayName })
  // Falls back gracefully — greeting shows without a name if unset
  const [firstName, setFirstName] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('chartis:profile')
      .then((raw) => {
        if (!raw) return;
        const p = JSON.parse(raw) as { displayName?: string };
        if (p.displayName) setFirstName(p.displayName.split(' ')[0]);
      })
      .catch(() => {});
  }, []);

  // Streak progress toward next milestone
  const milestone = nextStreakMilestone(streak.currentStreak);
  const milestonePct = streakMilestonePct(streak.currentStreak);

  // Most recently attempted topic for the "Continue" card
  const lastAttempt = state.attempts[state.attempts.length - 1];
  const continueTopic = lastAttempt
    ? TOPIC_METADATA.find((t) => t.id === lastAttempt.questionId.split('-')[0])
      ?? TOPIC_METADATA.find((t) => t.id === CFATopic.FixedIncome)
    : TOPIC_METADATA.find((t) => t.id === CFATopic.FixedIncome);
  const continueTopicProgress = continueTopic
    ? state.topicProgress[continueTopic.id]
    : undefined;

  // Dashboard topics: recently attempted first (desc by lastAttemptedAt),
  // then unfilled slots drawn from the default fallback list — always 4 shown
  const dashboardTopics = useMemo(() => {
    const attempted = TOPIC_METADATA.filter(
      (m) => (state.topicProgress[m.id]?.totalAttempted ?? 0) > 0
    ).sort((a, b) => {
      const aDate = state.topicProgress[a.id]?.lastAttemptedAt ?? '';
      const bDate = state.topicProgress[b.id]?.lastAttemptedAt ?? '';
      return bDate.localeCompare(aDate);
    });

    const attemptedIds = new Set(attempted.map((m) => m.id));
    const defaults = TOPIC_METADATA.filter(
      (m) => !attemptedIds.has(m.id) && DEFAULT_TOPIC_IDS.includes(m.id)
    );

    return [...attempted, ...defaults].slice(0, 4);
  }, [state.topicProgress]);

  const totalTopics = TOPIC_METADATA.length;

  // Accuracy bar colour — green above 70%, gold 40–70%, red below 40%
  const accuracyColor =
    stats.accuracyPercent >= 70
      ? theme.correct
      : stats.accuracyPercent >= 40
      ? theme.gold
      : theme.incorrect;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {firstName ? `${GREETING_PREFIX}, ${firstName}` : GREETING_PREFIX}
            </Text>
            <ChartisLogo size="lg" />
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CG</Text>
          </View>
        </View>

        {/* ── Streak card — full width, with progress toward next milestone ── */}
        <Pressable style={({ hovered }) => [styles.streakCard, hovered && styles.cardHovered]} onPress={() => router.push('/(tabs)/progress')}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakNum}>{streak.currentStreak}</Text>
              <Text style={styles.streakDayLabel}>day streak</Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakMilestoneLabel}>Next milestone: {milestone} days</Text>
            <View style={styles.milestoneTrack}>
              <View
                style={[
                  styles.milestoneFill,
                  { width: `${Math.min(milestonePct, 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.streakDaysAway}>
              {milestone - streak.currentStreak} day{milestone - streak.currentStreak !== 1 ? 's' : ''} away
            </Text>
          </View>
        </Pressable>

        {/* ── Metric cards — answered / accuracy / topics ── */}
        <View style={styles.metricRow}>

          {/* Answered */}
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.totalAttempted}</Text>
            <Text style={styles.metricLabel}>Answered</Text>
            <Text style={styles.metricSub}>Total questions</Text>
          </View>

          {/* Accuracy — numeric + horizontal bar replaces the ring */}
          <View style={[styles.metricCard, styles.metricCardWide]}>
            <Text style={[styles.metricValue, { color: accuracyColor }]}>
              {stats.accuracyPercent}%
            </Text>
            <View style={styles.accuracyTrack}>
              <View
                style={[
                  styles.accuracyFill,
                  { width: `${stats.accuracyPercent}%` as any, backgroundColor: accuracyColor },
                ]}
              />
            </View>
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={styles.metricSub}>{accuracyLabel(stats.accuracyPercent)}</Text>
          </View>

          {/* Topics */}
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.topicsStudied}</Text>
            <Text style={styles.metricLabel}>Topics</Text>
            <Text style={styles.metricSub}>of {totalTopics} unlocked</Text>
          </View>

        </View>

        {/* ── Insight banner — rule-based contextual nudge ── */}
        <InsightBanner
          stats={{
            totalAttempted: stats.totalAttempted,
            accuracyPercent: stats.accuracyPercent,
            topicsStudied: stats.topicsStudied,
            currentStreak: streak.currentStreak,
          }}
          theme={theme}
        />

        {/* ── Continue card — topic + per-topic stats ── */}
        {continueTopic && (
          <Pressable
            style={({ hovered }) => [styles.continueCard, hovered && styles.cardHovered]}
            onPress={() =>
              router.push({ pathname: '/study/session', params: { topic: continueTopic.id } })
            }
          >
            <View style={styles.continueLeft}>
              <Text style={styles.continueLabel}>Continue</Text>
              <Text style={styles.continueTopic}>{continueTopic.displayName}</Text>
              {continueTopicProgress && continueTopicProgress.totalAttempted > 0 && (
                <Text style={styles.continueMeta}>
                  {continueTopicProgress.totalAttempted} questions answered · {continueTopicProgress.accuracyPercent}% accuracy
                </Text>
              )}
            </View>
            <View style={styles.continueArrow}>
              <Text style={styles.continueArrowText}>›</Text>
            </View>
          </Pressable>
        )}

        {/* ── Topic grid — recently attempted first, then defaults ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TOPICS</Text>
          <Pressable style={({ hovered }) => [hovered && styles.sectionLinkHovered]} onPress={() => router.push('/(tabs)/topics')}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.topicsGrid}>
          {[0, 1].map((rowIdx) => (
            <View key={rowIdx} style={styles.topicsRow}>
              {dashboardTopics.slice(rowIdx * 2, rowIdx * 2 + 2).map((meta) => {
                const tp = state.topicProgress[meta.id];
                const pct = tp?.accuracyPercent ?? 0;
                const topicColor = CFAColors.topic[meta.colorKey] ?? theme.gold;

                return (
                  <Pressable
                    key={meta.id}
                    style={({ hovered }) => [styles.topicCard, hovered && styles.cardHovered]}
                    onPress={() =>
                      router.push({ pathname: '/topics/[topic]', params: { topic: meta.id } })
                    }
                  >
                    <View style={styles.topicCardTop}>
                      <View
                        style={[
                          styles.topicIconDot,
                          { backgroundColor: topicColor + '33', borderColor: topicColor + '55' },
                        ]}
                      >
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
                    <Text style={styles.topicCardName} numberOfLines={2}>
                      {meta.displayName}
                    </Text>
                    <Text style={styles.topicCardStatus} numberOfLines={1}>
                      {topicStatus(tp)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Quick start ── */}
        <Pressable
          style={({ hovered }) => [styles.startBtn, hovered && styles.startBtnHovered]}
          onPress={() => router.push('/study/session')}
        >
          <Text style={styles.startBtnText}>Start Practice Session</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── InsightBanner ────────────────────────────────────────────────────────────
// Renders a single contextual nudge derived from the user's stats.
// No API call — driven entirely by getInsightMessage().

function InsightBanner({
  stats,
  theme,
}: {
  stats: {
    totalAttempted: number;
    accuracyPercent: number;
    topicsStudied: number;
    currentStreak: number;
  };
  theme: Theme;
}) {
  const message = getInsightMessage(stats);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: theme.cardAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 17, lineHeight: 22 }}>💡</Text>
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          lineHeight: 20,
          color: theme.textSecondary,
          fontWeight: '500',
        }}
      >
        {message}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 14, paddingBottom: 40 },

    // Header
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { gap: 4 },
    greeting: { fontSize: 13, color: t.textSecondary, fontWeight: '500' },
    avatar: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: t.goldDim, borderWidth: 1.5, borderColor: t.gold,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: t.gold, fontSize: 14, fontWeight: '700' },

    // Streak card
    streakCard: {
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
      flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    streakFire: { fontSize: 30 },
    streakNum: { fontSize: 34, fontWeight: '800', color: t.text, lineHeight: 38 },
    streakDayLabel: { fontSize: 11, color: t.textSecondary, fontWeight: '500' },
    streakRight: { flex: 1, gap: 5 },
    streakMilestoneLabel: { fontSize: 11, fontWeight: '600', color: t.textSecondary },
    milestoneTrack: { height: 4, backgroundColor: t.border, borderRadius: 2, overflow: 'hidden' },
    milestoneFill: { height: 4, backgroundColor: t.gold, borderRadius: 2 },
    streakDaysAway: { fontSize: 10, color: t.textMuted },

    // Three metric cards
    metricRow: { flexDirection: 'row', gap: 8 },
    metricCard: {
      flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
      alignItems: 'center', gap: 2,
    },
    metricCardWide: { flex: 1.4, gap: 4 },
    metricValue: { fontSize: 22, fontWeight: '800', color: t.text },
    metricLabel: {
      fontSize: 9, color: t.textSecondary, fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center',
    },
    metricSub: { fontSize: 9, color: t.textMuted, textAlign: 'center' },
    accuracyTrack: { width: '90%', height: 4, backgroundColor: t.border, borderRadius: 2, overflow: 'hidden' },
    accuracyFill: { height: 4, borderRadius: 2 },

    // Continue card
    continueCard: {
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderRadius: 16, padding: 18, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
    },
    continueLeft: { gap: 3, flex: 1, marginRight: 12 },
    continueLabel: {
      fontSize: 11, color: t.textSecondary, fontWeight: '600',
      textTransform: 'uppercase', letterSpacing: 0.8,
    },
    continueTopic: { fontSize: 17, color: t.text, fontWeight: '700' },
    continueMeta: { fontSize: 12, color: t.textMuted, marginTop: 2 },
    continueArrow: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: t.goldDim, alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    continueArrowText: { color: t.gold, fontSize: 22, fontWeight: '600', marginTop: -2 },

    // Section header
    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: -2,
    },
    sectionTitle: { fontSize: 12, color: t.textSecondary, fontWeight: '700', letterSpacing: 1.2 },
    sectionLink: { fontSize: 13, color: t.gold, fontWeight: '600' },

    // Topic grid
    topicsGrid: { gap: 12 },
    topicsRow: { flexDirection: 'row', gap: 12 },
    topicCard: {
      flex: 1, backgroundColor: t.card, borderWidth: 1,
      borderColor: t.border, borderRadius: 14, padding: 14, gap: 6,
    },
    topicCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topicIconDot: {
      width: 38, height: 38, borderRadius: 10,
      borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    topicIconText: { fontSize: 12, fontWeight: '800' },
    topicCardName: { fontSize: 13, color: t.text, fontWeight: '600', lineHeight: 18 },
    topicCardStatus: { fontSize: 11, color: t.textMuted, fontWeight: '500' },

    // Quick start button
    startBtn: {
      backgroundColor: t.gold, borderRadius: 14,
      paddingVertical: 17, alignItems: 'center', marginTop: 4,
      cursor: 'pointer' as any,
    },
    startBtnHovered: { opacity: 0.88 },
    startBtnText: { color: '#0d0f14', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

    // Hover states (web only — cursor/pointer ignored on native)
    cardHovered: {
      borderColor: t.gold + '66',
      backgroundColor: t.cardAlt,
      cursor: 'pointer' as any,
    },
    sectionLinkHovered: { opacity: 0.75, cursor: 'pointer' as any },
  });
}
