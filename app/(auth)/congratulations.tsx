import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { useTheme } from '@/context/ThemeContext';

export default function CongratulationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ redirectTo?: string }>();

  const onContinue = () => {
    const redirect =
      typeof params.redirectTo === 'string' && params.redirectTo.length > 0
        ? params.redirectTo
        : '/(tabs)/marketplace';
    router.replace(redirect as never);
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.accent }]}>
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Congratulations!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Akun Anda sudah siap. Mulai jelajahi marketplace Mediator dan temukan mobil impian Anda.
        </Text>
      </View>

      <View style={styles.footer}>
        <AuthActionButton label="Go to Home" onPress={onContinue} variant="dark" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  iconCircle: {
    width: 184,
    height: 184,
    borderRadius: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    paddingBottom: 16,
  },
});
