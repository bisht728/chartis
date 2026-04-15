import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartisLogo } from '@/components/chartis-logo';
import { DARK } from '@/constants/theme';

export default function OnboardingScreen() {
  async function handleStartTrial() {
    await AsyncStorage.setItem('chartis:onboarded', 'true');
    router.replace('/(tabs)');
  }

  function handleLogin() {
    // For now also marks onboarded — login flow can be added later
    AsyncStorage.setItem('chartis:onboarded', 'true');
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <ChartisLogo size="md" />

        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CFA LEVEL II</Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headlineLine}>Master the</Text>
          <Text style={[styles.headlineLine, styles.headlineGold]}>gold standard</Text>
          <Text style={styles.headlineLine}>qualification.</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Concept-first question practice built for CFA Level II. Understand deeply, answer confidently.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>10</Text>
            <Text style={styles.statLabel}>Topics</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Day Trial</Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable style={styles.trialBtn} onPress={handleStartTrial}>
          <Text style={styles.trialBtnText}>Start Free Trial</Text>
        </Pressable>

        {/* Secondary link */}
        <Pressable onPress={handleLogin} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>I already have an account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  scroll: {
    padding: 28,
    paddingTop: 32,
    gap: 28,
    flexGrow: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: DARK.goldDim,
    borderWidth: 1,
    borderColor: DARK.gold,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    color: DARK.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headlineBlock: {
    gap: 2,
    marginTop: -4,
  },
  headlineLine: {
    fontSize: 44,
    fontWeight: '800',
    color: DARK.text,
    lineHeight: 52,
    letterSpacing: -1,
  },
  headlineGold: {
    color: DARK.gold,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: DARK.textSecondary,
    marginTop: -8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: DARK.card,
    borderWidth: 1,
    borderColor: DARK.border,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: DARK.text,
  },
  statLabel: {
    fontSize: 11,
    color: DARK.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  trialBtn: {
    backgroundColor: DARK.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  trialBtnText: {
    color: '#0d0f14',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: -12,
  },
  loginLinkText: {
    color: DARK.textSecondary,
    fontSize: 14,
  },
});
