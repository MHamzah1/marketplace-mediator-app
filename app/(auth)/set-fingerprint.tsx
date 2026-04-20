import React, { useState } from 'react';
import {
  Modal,
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
import { useTheme } from '@/context/ThemeContext';
import { Shadows } from '@/constants/Colors';

export default function SetFingerprintScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ redirectTo?: string; reason?: string }>();

  const [showConfirm, setShowConfirm] = useState(false);

  const onContinue = () => setShowConfirm(true);

  const onSkipOrComplete = () => {
    setShowConfirm(false);
    router.replace({
      pathname: '/(auth)/congratulations',
      params: {
        redirectTo: params.redirectTo,
        reason: params.reason,
      },
    });
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
          Add a fingerprint to make your account more secure.
        </Text>

        <View style={[styles.fingerprintCircle, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="finger-print" size={120} color={colors.text} />
        </View>

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          Please put your finger on the fingerprint scanner to get started.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={onSkipOrComplete}
          activeOpacity={0.82}
        >
          <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <AuthActionButton label="Continue" onPress={onContinue} variant="dark" />
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
              Please put your finger on the fingerprint scanner to confirm.
            </Text>

            <View style={[styles.fingerprintCircle, { backgroundColor: colors.backgroundSecondary, marginTop: 10 }]}>
              <Ionicons name="finger-print" size={96} color={colors.text} />
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.82}
              >
                <Text style={[styles.skipText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <AuthActionButton label="Continue" onPress={onSkipOrComplete} variant="dark" />
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
    letterSpacing: -0.4,
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
    letterSpacing: -0.6,
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
