import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ui/progress-ring';
import { CFAColors, Theme } from '@/constants/theme';
import { TOPIC_METADATA } from '@/data/topics';
import { getQuestionCountByTopic } from '@/db/database';
import { useProgressContext } from '@/context/progress-context';
import { useThemeContext } from '@/context/theme-context';
import { TopicMeta } from '@/types';

export default function TopicsScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { state } = useProgressContext();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    getQuestionCountByTopic().then(setCounts);
  }, []);

  const topics: TopicMeta[] = TOPIC_METADATA.map((t) => ({
    ...t,
    questionCount: counts[t.id] ?? 0,
  }));

  const attemptedTopics = TOPIC_METADATA.filter(
    (m) => (state.topicProgress[m.id]?.totalAttempted ?? 0) > 0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Topics</Text>
          <Text style={styles.subtitle}>CFA Level I · Select a topic to practise</Text>
        </View>

        {/* Topic grid */}
        <View style={styles.grid}>
          {topics.map((topic) => {
            const color = CFAColors.topic[topic.colorKey] ?? theme.gold;
            const tp = state.topicProgress[topic.id];
            const pct = tp?.accuracyPercent ?? 0;

            return (
              <Pressable
                key={topic.id}
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: '/topics/[topic]', params: { topic: topic.id } })
                }
              >
                <View style={[styles.colorBar, { backgroundColor: color }]} />
                <View style={styles.cardContent}>
                  {/* Top: name + ring */}
                  <View style={styles.cardTop}>
                    <Text style={styles.topicName} numberOfLines={3}>{topic.displayName}</Text>
                    <ProgressRing
                      percent={pct}
                      size={38}
                      strokeWidth={4}
                      color={color}
                      trackColor={theme.border}
                      showLabel={pct > 0}
                    />
                  </View>

                  {/* Bottom: weight + question count */}
                  <View style={styles.meta}>
                    <View style={[styles.weightBadge, { backgroundColor: color + '1A', borderColor: color + '44' }]}>
                      <Text style={[styles.weightText, { color }]}>{topic.examWeight}</Text>
                    </View>
                    {topic.questionCount > 0 && (
                      <Text style={styles.count}>{topic.questionCount}Q</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Analytics toggle */}
        <Pressable
          style={[styles.analyticsToggle, { borderColor: showAnalytics ? theme.gold : theme.border }]}
          onPress={() => setShowAnalytics((v) => !v)}
        >
          <Text style={[styles.analyticsToggleText, { color: showAnalytics ? theme.gold : theme.textSecondary }]}>
            {showAnalytics ? 'Hide Analytics' : 'Show Performance Analytics'}
          </Text>
          <Text style={[styles.analyticsChevron, { color: showAnalytics ? theme.gold : theme.textMuted }]}>
            {showAnalytics ? '▲' : '▼'}
          </Text>
        </Pressable>

        {/* Analytics panel */}
        {showAnalytics && (
          <View style={styles.analyticsPanel}>
            {attemptedTopics.length === 0 ? (
              <Text style={styles.analyticsEmpty}>
                No questions answered yet. Start practising to see your stats.
              </Text>
            ) : (
              <>
                <Text style={styles.analyticsSectionLabel}>ACCURACY BY TOPIC</Text>
                {attemptedTopics.map((meta) => {
                  const tp = state.topicProgress[meta.id]!;
                  const color = CFAColors.topic[meta.colorKey] ?? theme.gold;
                  const incorrect = tp.totalAttempted - tp.totalCorrect;

                  return (
                    <View key={meta.id} style={[styles.analyticsRow, { borderLeftColor: color }]}>
                      <View style={styles.analyticsInfo}>
                        <Text style={styles.analyticsTopicName}>{meta.displayName}</Text>
                        <View style={styles.analyticsStats}>
                          <StatPill label="Attempted" value={String(tp.totalAttempted)} color={theme.textSecondary} theme={theme} />
                          <StatPill label="Correct" value={String(tp.totalCorrect)} color={theme.correct} theme={theme} />
                          <StatPill label="Incorrect" value={String(incorrect)} color={theme.incorrect} theme={theme} />
                        </View>
                        {/* Accuracy bar */}
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${tp.accuracyPercent}%` as any, backgroundColor: color }]} />
                        </View>
                      </View>
                      <View style={styles.analyticsRing}>
                        <ProgressRing
                          percent={tp.accuracyPercent}
                          size={52}
                          strokeWidth={5}
                          color={color}
                          trackColor={theme.border}
                          showLabel
                        />
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ label, value, color, theme }: { label: string; value: string; color: string; theme: Theme }) {
  return (
    <View style={{ alignItems: 'center', gap: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: theme.textMuted, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 20, paddingBottom: 48 },
    header: { gap: 4 },
    title: { fontSize: 28, fontWeight: '800', color: t.text },
    subtitle: { fontSize: 13, color: t.textSecondary },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      width: '47%', backgroundColor: t.card, borderRadius: 14,
      borderWidth: 1, borderColor: t.border, overflow: 'hidden',
    },
    colorBar: { height: 3 },
    cardContent: { padding: 12, gap: 10 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
    topicName: { fontSize: 12, fontWeight: '700', color: t.text, lineHeight: 18, flex: 1 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    weightBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3 },
    weightText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    count: { fontSize: 10, fontWeight: '600', color: t.textMuted },

    analyticsToggle: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
      backgroundColor: t.card,
    },
    analyticsToggleText: { fontSize: 14, fontWeight: '600' },
    analyticsChevron: { fontSize: 11 },

    analyticsPanel: { gap: 16 },
    analyticsSectionLabel: {
      fontSize: 11, fontWeight: '700', color: t.textSecondary,
      letterSpacing: 1.2, textTransform: 'uppercase',
    },
    analyticsEmpty: { fontSize: 14, color: t.textSecondary, textAlign: 'center', paddingVertical: 16 },

    analyticsRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      borderLeftWidth: 3, borderRadius: 12,
      paddingVertical: 14, paddingHorizontal: 16, gap: 12,
    },
    analyticsInfo: { flex: 1, gap: 8 },
    analyticsTopicName: { fontSize: 13, fontWeight: '700', color: t.text },
    analyticsStats: { flexDirection: 'row', gap: 16 },
    barTrack: { height: 4, backgroundColor: t.border, borderRadius: 2, overflow: 'hidden' },
    barFill: { height: 4, borderRadius: 2 },
    analyticsRing: { alignItems: 'center', justifyContent: 'center' },
  });
}
