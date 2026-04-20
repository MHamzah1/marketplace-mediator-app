import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getOnboardingSeen } from '@/lib/auth/onboarding';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isLoggedIn, loading } = useAuth();
  const routedRef = useRef(false);

  useEffect(() => {
    if (loading || routedRef.current) return;

    let cancelled = false;
    const start = Date.now();

    (async () => {
      const seen = await getOnboardingSeen().catch(() => false);
      const elapsed = Date.now() - start;
      const minDelay = 1200;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }
      if (cancelled || routedRef.current) return;
      routedRef.current = true;

      if (isLoggedIn) {
        router.replace('/(tabs)/marketplace');
      } else if (!seen) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/(auth)/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, loading, router]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.gradientMiddle }]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={[styles.brandCircle, { backgroundColor: colors.white }]}>
          <Ionicons name="car-sport" size={64} color={colors.primary} />
        </View>

        <Text style={[styles.brand, { color: colors.white }]}>Mediator</Text>
        <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.72)' }]}>
          Marketplace mobil terpercaya
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.54)' }]}>
          Powered by Mediator
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  brandCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 8,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.6,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 48,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
