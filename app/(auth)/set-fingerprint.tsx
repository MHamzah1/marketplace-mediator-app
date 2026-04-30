import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { isAxiosError } from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { useTheme } from '@/context/ThemeContext';
import { Shadows } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import {
  clearPendingRegistration,
  getPendingRegistration,
} from '@/lib/auth/pendingRegistration';

export default function SetFingerprintScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { completeMarketplaceRegistration } = useAuth();
  const params = useLocalSearchParams<{ redirectTo?: string; reason?: string }>();

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const extractApiErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;

      if (Array.isArray(apiMessage)) {
        return apiMessage.join('\n');
      }

      if (typeof apiMessage === 'string') {
        return apiMessage;
      }
    }

    return error instanceof Error
      ? error.message
      : 'Registrasi gagal. Silakan coba lagi.';
  };

  const finishRegistration = async (biometricEnabled: boolean) => {
    try {
      setSubmitting(true);
      const pending = await getPendingRegistration();

      if (
        !pending.email ||
        !pending.verificationToken ||
        !pending.password ||
        !pending.fullName ||
        !pending.phoneNumber ||
        !pending.pin
      ) {
        Alert.alert(
          'Data Registrasi Tidak Lengkap',
          'Silakan ulangi proses registrasi dari awal.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/register') }],
        );
        return;
      }

      await completeMarketplaceRegistration({
        email: pending.email,
        verificationToken: pending.verificationToken,
        password: pending.password,
        fullName: pending.fullName,
        nickName: pending.nickName,
        phoneNumber: pending.phoneNumber,
        whatsappNumber: pending.whatsappNumber,
        location: pending.location,
        dateOfBirth: pending.dateOfBirth,
        gender: pending.gender,
        profilePhoto: pending.profilePhoto,
        pin: pending.pin,
        biometricEnabled,
      });

      await clearPendingRegistration();
      setShowConfirm(false);
      router.replace({
        pathname: '/(auth)/congratulations',
        params: {
          redirectTo: params.redirectTo,
          reason: params.reason,
        },
      });
    } catch (error: unknown) {
      Alert.alert('Registrasi Gagal', extractApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const authenticateAndFinish = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        'Biometrik Tidak Tersedia',
        'Perangkat belum memiliki sidik jari/face unlock yang aktif. Anda tetap bisa melanjutkan tanpa biometrik.',
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Konfirmasi sidik jari Mediator',
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      Alert.alert('Autentikasi Dibatalkan', 'Sidik jari belum diaktifkan.');
      return;
    }

    await finishRegistration(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Set Your Fingerprint</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Add a fingerprint to make your marketplace account easier and safer to open.
        </Text>

        <View style={[styles.fingerprintCircle, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="finger-print" size={120} color={colors.text} />
        </View>

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          You can also skip this step and keep using your PIN.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => finishRegistration(false)}
          activeOpacity={0.82}
          disabled={submitting}
        >
          <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <AuthActionButton
            label="Continue"
            onPress={() => setShowConfirm(true)}
            loading={submitting}
            variant="dark"
          />
        </View>
      </View>

      <Modal visible={showConfirm} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.sheet,
              Shadows.large,
              { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.sheetTitle, { color: colors.text }]}>Fingerprint</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Put your finger on the scanner to activate biometric access.
            </Text>

            <View style={[styles.fingerprintCircle, { backgroundColor: colors.backgroundSecondary, marginTop: 10 }]}>
              <Ionicons name="finger-print" size={96} color={colors.text} />
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.82}
                disabled={submitting}
              >
                <Text style={[styles.skipText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <AuthActionButton
                  label="Activate"
                  onPress={authenticateAndFinish}
                  loading={submitting}
                  variant="dark"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  fingerprintCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipButton: {
    height: 58,
    minWidth: 110,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    alignItems: 'center',
    gap: 14,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignSelf: 'stretch',
  },
});
