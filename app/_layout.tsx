import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={Colors.primaryDark} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="listing/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="search/index"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </AuthProvider>
  );
}
