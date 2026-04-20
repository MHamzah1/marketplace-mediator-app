import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="login-password" />
      <Stack.Screen name="register" />
      <Stack.Screen name="account-setup" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="set-fingerprint" />
      <Stack.Screen name="congratulations" options={{ animation: 'fade' }} />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-reset" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
