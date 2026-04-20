import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { getOnboardingSeen } from '@/lib/auth/onboarding';

// Custom premium colors — intentionally decoupled from app theme
const SPLASH = {
  bg: '#07111F',
  gradTop: '#060D1A',
  gradMid: '#0C1D38',
  gradBot: '#0E2347',
  ring1: 'rgba(250,176,5,0.18)',
  ring2: 'rgba(250,176,5,0.07)',
  gold: '#FAB005',
  goldDark: '#E67700',
  iconBg: '#FAB005',
  iconColor: '#07111F',
  dot: 'rgba(250,176,5,0.55)',
  dotDim: 'rgba(255,255,255,0.12)',
  white: '#FFFFFF',
  tagline: 'rgba(255,255,255,0.56)',
  footer: 'rgba(255,255,255,0.3)',
};

export default function SplashScreen() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const routedRef = useRef(false);

  useEffect(() => {
    if (loading || routedRef.current) return;

    let cancelled = false;
    const start = Date.now();

    (async () => {
      const seen = await getOnboardingSeen().catch(() => false);
      const elapsed = Date.now() - start;
      const minDelay = 1400;
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
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[SPLASH.gradTop, SPLASH.gradMid, SPLASH.gradBot]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative radial rings around icon */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[SPLASH.gold, SPLASH.goldDark]}
            style={styles.iconCircle}
          >
            <Ionicons name="car-sport" size={58} color={SPLASH.iconColor} />
          </LinearGradient>
        </View>

        <Text style={styles.brand}>Mediator</Text>
        <Text style={styles.tagline}>Marketplace Mobil Terpercaya</Text>

        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: SPLASH.dot }]} />
          <View style={[styles.dot, { backgroundColor: SPLASH.dotDim }]} />
          <View style={[styles.dot, { backgroundColor: SPLASH.dotDim }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.footerLine, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <Text style={styles.footerText}>Powered by Mediator © 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SPLASH.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: SPLASH.ring1,
  },
  ringInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: SPLASH.ring2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconWrap: {
    marginBottom: 4,
    shadowColor: SPLASH.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.4,
    color: SPLASH.white,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: SPLASH.tagline,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 24,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  footer: {
    paddingBottom: 52,
    alignItems: 'center',
    gap: 14,
  },
  footerLine: {
    width: 40,
    height: 1,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: SPLASH.footer,
  },
});
