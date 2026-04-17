import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/theme';
import { useProgressContext } from '@/context/progress-context';
import { useThemeContext } from '@/context/theme-context';
import { resetStreak } from '@/storage/progress-storage';

export default function SettingsScreen() {
  const { reset } = useProgressContext();
  const { theme, isDark, toggleTheme } = useThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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
            <View style={styles.themeControl}>
              <Text style={styles.value}>{isDark ? 'Dark' : 'Light'}</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.gold + '88' }}
                thumbColor={theme.gold}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <Pressable style={({ hovered }) => [styles.dangerRow, hovered && styles.dangerRowHovered]} onPress={confirmReset}>
            <Text style={styles.dangerLabel}>Reset All Progress</Text>
            <Text style={styles.rowHint}>Clears answers, accuracy, and streak</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={({ hovered }) => [styles.dangerRow, hovered && styles.dangerRowHovered]} onPress={confirmSignOut}>
            <Text style={styles.dangerLabel}>Sign Out</Text>
            <Text style={styles.rowHint}>Return to onboarding</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scroll: { padding: 22, gap: 16, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: '800', color: t.text },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: -4,
    },
    section: {
      backgroundColor: t.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    label: { fontSize: 15, color: t.text },
    value: { fontSize: 15, color: t.textSecondary },
    themeControl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    divider: { height: 1, backgroundColor: t.border, marginHorizontal: 16 },
    dangerRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 2, cursor: 'pointer' as any },
    dangerRowHovered: { backgroundColor: t.incorrect + '18' },
    dangerLabel: { fontSize: 15, color: t.incorrect, fontWeight: '600' },
    rowHint: { fontSize: 12, color: t.textMuted },
  });
}
