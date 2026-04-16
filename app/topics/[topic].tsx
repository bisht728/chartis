import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DARK, CFAColors } from '@/constants/theme';
import { TOPIC_METADATA } from '@/data/topics';
import { fetchFilteredCount, fetchModulesForTopic } from '@/services/questions';
import { QuestionFilters } from '@/services/questions';

const DIFFICULTIES: { label: string; value: string; color?: string }[] = [
  { label: 'All',    value: '' },
  { label: 'Easy',   value: 'easy',   color: '#22C55E' },
  { label: 'Medium', value: 'medium', color: '#D97706' },
  { label: 'Hard',   value: 'hard',   color: '#EF4444' },
];

const TYPES = [
  { label: 'All',         value: '' },
  { label: 'Fundamental', value: 'fundamental' },
  { label: 'Applied',     value: 'applied' },
];

const SESSION_SIZES = [5, 10, 15, 20];

export default function TopicFilterScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const meta = TOPIC_METADATA.find((t) => t.id === topic);
  const topicColor = meta ? (CFAColors.topic[meta.colorKey] ?? DARK.gold) : DARK.gold;

  const [modules, setModules] = useState<string[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const [selectedModule, setSelectedModule]       = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType]           = useState('');
  const [sessionSize, setSessionSize]             = useState(10);

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Load modules for this topic
  useEffect(() => {
    fetchModulesForTopic(topic)
      .then(setModules)
      .finally(() => setLoadingModules(false));
  }, [topic]);

  // Recount whenever filters change
  useEffect(() => {
    setMatchCount(null);
    setCountLoading(true);
    const filters: QuestionFilters = { topic };
    if (selectedModule)     filters.module     = selectedModule;
    if (selectedDifficulty) filters.difficulty = selectedDifficulty as QuestionFilters['difficulty'];
    if (selectedType)       filters.type       = selectedType as QuestionFilters['type'];

    fetchFilteredCount(filters)
      .then(setMatchCount)
      .finally(() => setCountLoading(false));
  }, [topic, selectedModule, selectedDifficulty, selectedType]);

  function handleStart() {
    const params: Record<string, string> = { topic, size: String(sessionSize) };
    if (selectedModule)     params.module     = selectedModule;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    if (selectedType)       params.type       = selectedType;
    router.push({ pathname: '/study/session', params });
  }

  const canStart = matchCount !== null && matchCount > 0;
  const effectiveCount = matchCount != null ? Math.min(matchCount, sessionSize) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Topic header */}
        <View style={[styles.header, { borderLeftColor: topicColor }]}>
          <Text style={[styles.title, { color: topicColor }]}>{meta?.shortName ?? topic}</Text>
          <Text style={styles.subtitle}>{meta?.displayName ?? topic}</Text>
        </View>

        {/* MODULE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODULE</Text>
          {loadingModules ? (
            <ActivityIndicator color={topicColor} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <Chip
                  label="All modules"
                  selected={selectedModule === ''}
                  color={topicColor}
                  onPress={() => setSelectedModule('')}
                />
                {modules.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    selected={selectedModule === m}
                    color={topicColor}
                    onPress={() => setSelectedModule(m)}
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* DIFFICULTY */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DIFFICULTY</Text>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map(({ label, value, color }) => (
              <Chip
                key={value || 'all'}
                label={label}
                selected={selectedDifficulty === value}
                color={color ?? topicColor}
                onPress={() => setSelectedDifficulty(value)}
              />
            ))}
          </View>
        </View>

        {/* TYPE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TYPE</Text>
          <View style={styles.chipRow}>
            {TYPES.map(({ label, value }) => (
              <Chip
                key={value || 'all'}
                label={label}
                selected={selectedType === value}
                color={topicColor}
                onPress={() => setSelectedType(value)}
              />
            ))}
          </View>
        </View>

        {/* SESSION SIZE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SESSION SIZE</Text>
          <View style={styles.chipRow}>
            {SESSION_SIZES.map((size) => (
              <Chip
                key={size}
                label={`${size} Qs`}
                selected={sessionSize === size}
                color={topicColor}
                onPress={() => setSessionSize(size)}
              />
            ))}
          </View>
        </View>

        {/* Match count summary */}
        <View style={styles.summaryRow}>
          {countLoading ? (
            <ActivityIndicator size="small" color={topicColor} />
          ) : matchCount !== null ? (
            <Text style={styles.summaryText}>
              <Text style={[styles.summaryCount, { color: matchCount > 0 ? topicColor : DARK.incorrect }]}>
                {matchCount}
              </Text>
              {' '}question{matchCount !== 1 ? 's' : ''} match your filters
            </Text>
          ) : null}
        </View>

        {/* Start button */}
        <Pressable
          style={[styles.startBtn, { backgroundColor: canStart ? topicColor : DARK.card }]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={[styles.startBtnText, { color: canStart ? '#0d0f14' : DARK.textMuted }]}>
            {!canStart
              ? 'No questions match'
              : `Start Session · ${effectiveCount} question${effectiveCount !== 1 ? 's' : ''}`}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label, selected, color, onPress,
}: {
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: color + '22', borderColor: color },
      ]}
    >
      <Text style={[styles.chipText, selected && { color, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 28, paddingBottom: 48 },

  header: { borderLeftWidth: 3, paddingLeft: 12, gap: 4 },
  title:  { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, color: DARK.textSecondary },

  section: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DARK.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: DARK.card,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: DARK.textSecondary },

  summaryRow: { alignItems: 'center', minHeight: 24 },
  summaryText: { fontSize: 14, color: DARK.textSecondary },
  summaryCount: { fontSize: 16, fontWeight: '800' },

  startBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
