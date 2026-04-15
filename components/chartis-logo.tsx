import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { DARK } from '../constants/theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 18, font: 16, gap: 6 },
  md: { icon: 24, font: 20, gap: 8 },
  lg: { icon: 30, font: 26, gap: 10 },
};

export function ChartisLogo({ size = 'md' }: Props) {
  const s = sizes[size];
  return (
    <View style={[styles.row, { gap: s.gap }]}>
      <View style={[styles.iconWrap, { width: s.icon + 8, height: s.icon + 8, borderRadius: 8 }]}>
        <Svg width={s.icon} height={s.icon} viewBox="0 0 24 24">
          <Polyline
            points="3,17 8,11 13,14 21,5"
            fill="none"
            stroke={DARK.gold}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Polyline
            points="3,21 21,21"
            fill="none"
            stroke={DARK.gold}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <Text style={[styles.wordmark, { fontSize: s.font }]}>Chartis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    backgroundColor: DARK.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: DARK.text,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
