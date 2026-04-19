import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
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
        <Stack.Screen
          name="my-listings"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="create-listing"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="seller/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </AuthProvider>
  );
}
