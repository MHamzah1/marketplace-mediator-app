import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function ThemedStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
