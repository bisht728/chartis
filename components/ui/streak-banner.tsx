import { StyleSheet, Text, View } from 'react-native';
import { CFAColors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface Props {
  currentStreak: number;
  bestStreak: number;
}

export function StreakBanner({ currentStreak, bestStreak }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const surface = CFAColors.cardSurface[scheme];
  const border = CFAColors.cardBorder[scheme];

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      <View style={styles.main}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={[styles.count, { color: CFAColors.streakFire }]}>{currentStreak}</Text>
        <Text style={styles.label}>day streak</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.best}>
        <Text style={styles.bestLabel}>Best</Text>
        <Text style={[styles.bestCount, { color: CFAColors.streakFire }]}>{bestStreak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fire: {
    fontSize: 22,
  },
  count: {
    fontSize: 28,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  best: {
    alignItems: 'center',
    paddingLeft: 16,
  },
  bestLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bestCount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
