import { Stack } from 'expo-router';
import { SessionProvider } from '@/context/session-context';

export default function StudyLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }}>
        <Stack.Screen name="session" options={{ title: 'Practice Session' }} />
        <Stack.Screen name="[id]" options={{ title: 'Review' }} />
      </Stack>
    </SessionProvider>
  );
}
