import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CFAColors, Theme } from '@/constants/theme';
import { TOPIC_METADATA } from '@/data/topics';
import { getQuestionCountByTopic } from '@/db/database';
import { useThemeContext } from '@/context/theme-context';
import { TopicMeta } from '@/types';

export default function TopicsScreen() {
  const { theme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getQuestionCountByTopic().then(setCounts);
  }, []);

  const topics: TopicMeta[] = TOPIC_METADATA.map((t) => ({
    ...t,
    questionCount: counts[t.id] ?? 0,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Topics</Text>
          <Text style={styles.subtitle}>Select a topic to practice</Text>
        </View>

        <View style={styles.grid}>
          {topics.map((topic) => {
            const color = CFAColors.topic[topic.colorKey] ?? theme.gold;
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
                  <Text style={styles.topicName}>{topic.shortName}</Text>
                  <Text style={styles.topicFull} numberOfLines={2}>{topic.displayName}</Text>
                  <Text style={[styles.count, { color }]}>
                    {topic.questionCount} {topic.questionCount === 1 ? 'question' : 'questions'}
                  </Text>
                </View>
              </Pressable>
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
    header: { gap: 4 },
    title: { fontSize: 28, fontWeight: '800', color: t.text },
    subtitle: { fontSize: 14, color: t.textSecondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      width: '47%', backgroundColor: t.card, borderRadius: 14,
      borderWidth: 1, borderColor: t.border, overflow: 'hidden',
    },
    colorBar: { height: 3 },
    cardContent: { padding: 14, gap: 4 },
    topicName: { fontSize: 15, fontWeight: '700', color: t.text },
    topicFull: { fontSize: 12, color: t.textSecondary, lineHeight: 18 },
    count: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  });
}
