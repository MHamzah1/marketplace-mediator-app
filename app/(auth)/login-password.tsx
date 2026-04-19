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
import Colors from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';

export default function LoginPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const { redirectTo, email: initialEmail } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: 'whatsapp' | 'sell' | 'manage-listings' | 'protected';
    email?: string;
  }>();

  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const targetRoute =
    typeof redirectTo === 'string' && redirectTo.length > 0
      ? redirectTo
      : '/(tabs)/marketplace';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi email dan password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(targetRoute as never);
    } catch (error: any) {
      Alert.alert(
        'Login Gagal',
        error?.response?.data?.message ||
          (error?.request
            ? `Tidak dapat terhubung ke server ${API_BASE_URL}. Pastikan URL API sudah benar.`
            : 'Email atau password salah.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

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
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name="lock-closed" size={28} color={Colors.white} />
          </View>

          <Text style={styles.title}>Masuk dengan password</Text>
          <Text style={styles.subtitle}>
            Masukkan kredensial akun Mediator Anda untuk lanjut ke marketplace.
          </Text>

          <View style={styles.form}>
            <AuthInputField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthInputField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
              autoComplete="password"
            />

            <View style={styles.metaRow}>
              <AuthCheckbox
                checked={rememberMe}
                onPress={() => setRememberMe((prev) => !prev)}
                label="Remember me"
              />
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.metaLink}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            <AuthActionButton
              label="Masuk"
              icon="log-in-outline"
              loading={loading}
              onPress={handleLogin}
              variant="dark"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
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
    marginTop: 30,
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginTop: 30,
    gap: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
