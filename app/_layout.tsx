import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ProgressProvider } from '@/context/progress-context';
import { DARK } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // null = still loading, true/false = resolved
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('chartis:onboarded').then((val) => {
      setIsOnboarded(val === 'true');
    });
  }, []);

  return (
    <ProgressProvider>
      {isOnboarded === false && <Redirect href="/onboarding" />}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: DARK.bg } }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="study" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ProgressProvider>
  );
}
