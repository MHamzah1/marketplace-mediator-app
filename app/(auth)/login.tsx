import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import AuthSocialButtons from '@/components/auth/AuthSocialButtons';
import Colors from '@/constants/Colors';

const reasonMessages = {
  whatsapp: 'Masuk dulu untuk menghubungi penjual via WhatsApp.',
  sell: 'Masuk dulu untuk memasang atau mengubah listing.',
  'manage-listings': 'Masuk dulu untuk melihat dan mengelola listing Anda.',
  protected: 'Masuk untuk melanjutkan aktivitas Anda di Mediator.',
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { redirectTo, reason } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: keyof typeof reasonMessages;
  }>();

  const reasonMessage = reasonMessages[reason || 'protected'];

  const handleSocialPress = (provider: 'facebook' | 'google' | 'apple') => {
    Alert.alert(
      'Segera Hadir',
      `Masuk dengan ${provider} akan kami aktifkan di tahap berikutnya.`,
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="car-sport" size={34} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Let&apos;s get you in</Text>
        <Text style={styles.subtitle}>{reasonMessage}</Text>

        <View style={styles.socialSection}>
          <AuthSocialButtons dark onPress={handleSocialPress} />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        <AuthActionButton
          label="Masuk dengan password"
          onPress={() =>
            router.push({
              pathname: '/(auth)/login-password',
              params: {
                redirectTo,
                reason,
              },
            })
          }
          variant="light"
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Belum punya akun?</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(auth)/register',
                params: {
                  redirectTo,
                  reason,
                },
              })
            }
          >
            <Text style={styles.footerLink}>Daftar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  header: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 42,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  socialSection: {
    marginTop: 32,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.58)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '600',
  },
  footerLink: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '800',
  },
});
