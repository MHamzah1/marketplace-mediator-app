import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import AuthActionButton from '@/components/auth/AuthActionButton';
import Colors from '@/constants/Colors';
import { setOnboardingSeen } from '@/lib/auth/onboarding';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const navigateToAuth = async () => {
    await setOnboardingSeen(true);
    router.replace('/(auth)/login');
  };

  const continueAsGuest = async () => {
    await setOnboardingSeen(true);
    router.replace('/(tabs)/marketplace');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <Image
          source={require('@/assets/images/onboarding-hero.png')}
          style={styles.heroImage}
          contentFit="cover"
          contentPosition="top"
        />
        <LinearGradient
          colors={['transparent', 'rgba(36,107,253,0.32)', 'rgba(21,87,229,0.96)']}
          style={styles.heroOverlay}
        />
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.brandPill}>
          <Text style={styles.brandPillText}>Mediator</Text>
        </View>

        <Text style={styles.title}>Marketplace mobil premium untuk kebutuhan Anda.</Text>
        <Text style={styles.subtitle}>
          Temukan mobil pilihan, pasang listing, dan hubungi penjual langsung lewat WhatsApp dalam satu aplikasi.
        </Text>

        <AuthActionButton
          label="Masuk / Daftar"
          icon="arrow-forward"
          onPress={navigateToAuth}
          variant="dark"
        />

        <TouchableOpacity style={styles.guestButton} onPress={continueAsGuest}>
          <Text style={styles.guestButtonText}>Jelajahi marketplace dulu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  hero: {
    flex: 1,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: Colors.primaryDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -48,
    gap: 16,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  brandPillText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.74)',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
});
