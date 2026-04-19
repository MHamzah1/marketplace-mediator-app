import React, { useMemo, useState } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import AuthCheckbox from '@/components/auth/AuthCheckbox';
import AuthInputField from '@/components/auth/AuthInputField';
import Colors, { Shadows } from '@/constants/Colors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const canContinue = useMemo(
    () =>
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword,
    [confirmPassword, password],
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Create New Password</Text>

          <View style={styles.heroBlock}>
            <View style={styles.phoneMock}>
              <Ionicons name="checkmark" size={40} color={Colors.white} />
            </View>
            <Ionicons name="sparkles" size={54} color="rgba(255,255,255,0.08)" />
          </View>

          <Text style={styles.subtitle}>Create your new password</Text>

          <View style={styles.form}>
            <AuthInputField
              dark
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Password baru"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
            />
            <AuthInputField
              dark
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Konfirmasi password"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
            />

            <AuthCheckbox
              dark
              checked={rememberMe}
              onPress={() => setRememberMe((prev) => !prev)}
              label="Remember me"
            />

            <AuthActionButton
              label="Continue"
              disabled={!canContinue}
              onPress={() => setShowSuccess(true)}
              variant="light"
            />
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.large]}>
            <View style={styles.modalIcon}>
              <Ionicons name="shield-checkmark" size={30} color={Colors.white} />
            </View>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>
              Password baru Anda siap digunakan. Lanjut masuk ke Mediator.
            </Text>
            <AuthActionButton
              label="Masuk sekarang"
              onPress={() => router.replace('/(auth)/login-password')}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.8,
  },
  heroBlock: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  phoneMock: {
    width: 112,
    height: 166,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  form: {
    marginTop: 22,
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: Colors.background,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  modalIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
});
