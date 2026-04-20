import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { getOnboardingSeen } from '@/lib/auth/onboarding';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const seen = await getOnboardingSeen().catch(() => false);
      router.replace(seen ? '/(tabs)/marketplace' : '/(auth)/welcome');
    }, 1600);

    return () => clearTimeout(timer);
  }, [router]);

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
        <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.62)' }]}>
          Marketplace mobil terpercaya
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.48)' }]}>
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
