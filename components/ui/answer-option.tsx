import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '@/context/theme-context';
import { AnswerKey } from '../../types';

type AnswerState = 'idle' | 'selected' | 'correct' | 'incorrect';

interface Props {
  answerKey: AnswerKey;
  text: string;
  state: AnswerState;
  onPress?: () => void;
  disabled?: boolean;
}

export function AnswerOption({ answerKey, text, state, onPress, disabled }: Props) {
  const { theme: t } = useThemeContext();

  const isCorrect   = state === 'correct';
  const isIncorrect = state === 'incorrect';
  const isSelected  = state === 'selected';
  const isActive    = isCorrect || isIncorrect || isSelected;

  const borderColor = isCorrect ? t.correct : isIncorrect ? t.incorrect : isSelected ? t.gold : t.border;
  const bgColor     = isCorrect ? t.correctDim : isIncorrect ? t.incorrectDim : isSelected ? t.goldDim : t.card;
  const dotBg       = isCorrect ? t.correct : isIncorrect ? t.incorrect : isSelected ? t.gold : 'transparent';
  const dotBorder   = isCorrect ? t.correct : isIncorrect ? t.incorrect : isSelected ? t.gold : t.borderLight;
  const dotTextColor = isActive ? '#0d0f14' : t.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.container, { borderColor, backgroundColor: bgColor }]}
    >
      <View style={[styles.dot, { backgroundColor: dotBg, borderColor: dotBorder }]}>
        <Text style={[styles.dotText, { color: dotTextColor }]}>{answerKey}</Text>
      </View>
      <Text style={[styles.text, { color: isActive ? t.text : t.textSecondary }]}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  dotText: { fontSize: 12, fontWeight: '700' },
  text: { flex: 1, fontSize: 15, lineHeight: 23, fontWeight: '400' },
});
