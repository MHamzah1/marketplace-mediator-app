import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import AuthCheckbox from '@/components/auth/AuthCheckbox';
import AuthInputField from '@/components/auth/AuthInputField';
import AuthSocialButtons from '@/components/auth/AuthSocialButtons';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const { redirectTo, reason } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: 'whatsapp' | 'sell' | 'manage-listings' | 'protected';
  }>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSocialPress = (provider: 'facebook' | 'google' | 'apple') => {
    Alert.alert(
      'Segera Hadir',
      `Daftar dengan ${provider} akan kami aktifkan di tahap berikutnya.`,
    );
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi nama, email, dan password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Tidak Cocok', 'Ulangi konfirmasi password Anda.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Terlalu Pendek', 'Password minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      router.replace({
        pathname: '/(auth)/account-setup',
        params: {
          fullName: fullName.trim(),
          email: email.trim(),
          redirectTo,
          reason,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Registrasi gagal. Silakan coba lagi.';
      Alert.alert('Registrasi Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name="car-sport" size={28} color={Colors.white} />
          </View>

          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Daftar dengan gaya baru Mediator dan lanjutkan ke setup profil.
          </Text>

          <View style={styles.form}>
            <AuthInputField
              dark
              label="Nama Lengkap"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nama lengkap Anda"
              autoCapitalize="words"
              autoComplete="name"
            />
            <AuthInputField
              dark
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthInputField
              dark
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 6 karakter"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
              autoComplete="new-password"
            />
            <AuthInputField
              dark
              label="Konfirmasi Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi password"
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
              label="Daftar"
              icon="person-add-outline"
              loading={loading}
              onPress={handleRegister}
              variant="light"
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau lanjut dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            <AuthSocialButtons dark onPress={handleSocialPress} />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.footerLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 22,
  },
  title: {
    marginTop: 22,
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '600',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
});
