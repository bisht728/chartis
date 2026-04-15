import { StyleSheet, Text, View } from 'react-native';
import { CFAColors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface Props {
  value: string | number;
  label: string;
  accentColor?: string;
}

export function StatCard({ value, label, accentColor }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const surface = CFAColors.cardSurface[scheme];
  const border = CFAColors.cardBorder[scheme];
  const textColor = accentColor ?? '#111827';

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
