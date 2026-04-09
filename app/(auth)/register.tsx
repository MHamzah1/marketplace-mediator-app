import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { buildLoginRoute } from '@/lib/auth/requireAuth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { redirectTo, reason } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: 'whatsapp' | 'sell' | 'manage-listings' | 'protected';
  }>();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phone.trim() || undefined,
      });
      Alert.alert('Berhasil', 'Akun berhasil dibuat! Silakan masuk.', [
        {
          text: 'OK',
          onPress: () =>
            router.replace(
              buildLoginRoute(
                typeof redirectTo === 'string' && redirectTo.length > 0
                  ? redirectTo
                  : '/(tabs)/marketplace',
                reason || 'protected',
              ) as never,
            ),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registrasi Gagal',
        error?.response?.data?.message || 'Terjadi kesalahan, coba lagi',
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'fullName',
      label: 'Nama Lengkap',
      placeholder: 'Masukkan nama lengkap',
      icon: 'person-outline' as const,
      value: fullName,
      onChangeText: setFullName,
      autoComplete: 'name' as const,
    },
    {
      key: 'email',
      label: 'Email',
      placeholder: 'nama@email.com',
      icon: 'mail-outline' as const,
      value: email,
      onChangeText: setEmail,
      keyboardType: 'email-address' as const,
      autoComplete: 'email' as const,
      autoCapitalize: 'none' as const,
    },
    {
      key: 'phone',
      label: 'No. Telepon (Opsional)',
      placeholder: '08xxxxxxxxxx',
      icon: 'call-outline' as const,
      value: phone,
      onChangeText: setPhone,
      keyboardType: 'phone-pad' as const,
      autoComplete: 'tel' as const,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Gradient */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.topSection, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Buat Akun</Text>
          <Text style={styles.brandSubtitle}>Bergabung dengan Mediator</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formSection}>
          <View style={[styles.formCard, Shadows.large]}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={field.icon} size={20} color={Colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.onChangeText}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={field.autoCapitalize}
                    autoComplete={field.autoComplete}
                  />
                </View>
              </View>
            ))}

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Konfirmasi Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ulangi password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.registerBtn, Shadows.blue]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={22} color={Colors.white} />
                    <Text style={styles.registerBtnText}>Daftar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity
              onPress={() =>
                router.replace(
                  buildLoginRoute(
                    typeof redirectTo === 'string' && redirectTo.length > 0
                      ? redirectTo
                      : '/(tabs)/marketplace',
                    reason || 'protected',
                  ) as never,
                )
              }
            >
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
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
  topSection: {
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 4,
  },
  formSection: {
    padding: 16,
    marginTop: -24,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
  },
  registerBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});
