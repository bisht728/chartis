import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ProgressProvider } from '@/context/progress-context';
import { DARK } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('chartis:onboarded').then((val) => {
      setReady(true);
      if (val !== 'true') router.replace('/onboarding');
    });
  }, []);

  if (!ready) return null;

  return (
    <ProgressProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: DARK.bg } }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="study" />
        <Stack.Screen name="topics" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ProgressProvider>
  );
}
