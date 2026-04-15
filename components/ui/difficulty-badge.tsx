import { StyleSheet, Text, View } from 'react-native';
import { Difficulty } from '../../types';
import { CFAColors } from '../../constants/theme';

const LABELS: Record<Difficulty, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

interface Props {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: Props) {
  const color = CFAColors.difficulty[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
