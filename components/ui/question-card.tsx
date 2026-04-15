import { StyleSheet, Text, View } from 'react-native';
import { Question } from '../../types';
import { CFAColors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { TopicChip } from './topic-chip';
import { DifficultyBadge } from './difficulty-badge';
import { TOPIC_METADATA } from '../../data/topics';

interface Props {
  question: Question;
  index?: number;
  total?: number;
}

export function QuestionCard({ question, index, total }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const surface = CFAColors.cardSurface[scheme];
  const border = CFAColors.cardBorder[scheme];
  const topicMeta = TOPIC_METADATA.find((t) => t.id === question.topic);

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      {index !== undefined && total !== undefined && (
        <Text style={styles.counter}>
          Question {index + 1} of {total}
        </Text>
      )}
      <View style={styles.meta}>
        {topicMeta && <TopicChip topic={question.topic} shortName={topicMeta.shortName} />}
        <DifficultyBadge difficulty={question.difficulty} />
      </View>
      <Text style={styles.los}>LOS {question.los}</Text>
      <Text style={styles.text}>{question.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  counter: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  los: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#111827',
  },
});
