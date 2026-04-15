import { StyleSheet, Text, View } from 'react-native';
import { CFATopic } from '../../types';
import { CFAColors } from '../../constants/theme';

interface Props {
  topic: CFATopic;
  shortName: string;
}

export function TopicChip({ topic, shortName }: Props) {
  const color = CFAColors.topic[topic] ?? '#6B7280';
  return (
    <View style={[styles.chip, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{shortName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
