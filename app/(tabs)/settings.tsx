import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DARK } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { resetStreak } from '@/storage/progress-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { reset } = useProgressContext();

  function confirmReset() {
    Alert.alert(
      'Reset All Progress',
      'This will permanently delete all your answers, topic progress, and streak data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            reset();
            await resetStreak();
          },
        },
      ]
    );
  }

  function confirmSignOut() {
    Alert.alert('Sign Out', 'Return to the onboarding screen?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('chartis:onboarded');
          router.replace('/onboarding');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionLabel}>App Info</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>App</Text>
            <Text style={styles.value}>Chartis</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Theme</Text>
            <Text style={styles.value}>Dark</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <Pressable style={styles.dangerRow} onPress={confirmReset}>
            <Text style={styles.dangerLabel}>Reset All Progress</Text>
            <Text style={styles.rowHint}>Clears answers, accuracy, and streak</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.dangerRow} onPress={confirmSignOut}>
            <Text style={styles.dangerLabel}>Sign Out</Text>
            <Text style={styles.rowHint}>Return to onboarding</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 22, gap: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: DARK.text },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: -4,
  },
  section: {
    backgroundColor: DARK.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 15, color: DARK.text },
  value: { fontSize: 15, color: DARK.textSecondary },
  divider: { height: 1, backgroundColor: DARK.border, marginHorizontal: 16 },
  dangerRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 2 },
  dangerLabel: { fontSize: 15, color: DARK.incorrect, fontWeight: '600' },
  rowHint: { fontSize: 12, color: DARK.textMuted },
});
