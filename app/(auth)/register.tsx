import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { isAxiosError } from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthActionButton from "@/components/auth/AuthActionButton";
import AuthCheckbox from "@/components/auth/AuthCheckbox";
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const { redirectTo, reason } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: "whatsapp" | "sell" | "manage-listings" | "protected";
  }>();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const normalizePhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    if (digits.startsWith("62")) {
      return `+${digits}`;
    }

    if (digits.startsWith("0")) {
      return `+62${digits.slice(1)}`;
    }

    if (digits.startsWith("8")) {
      return `+62${digits}`;
    }

    return value.trim();
  };

  const extractApiErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;

      if (Array.isArray(apiMessage)) {
        return apiMessage.join("\n");
      }

      if (typeof apiMessage === "string") {
        return apiMessage;
      }
    }

    return error instanceof Error
      ? error.message
      : "Registrasi gagal. Silakan coba lagi.";
  };

  const handleSocialPress = (provider: "facebook" | "google" | "apple") => {
    Alert.alert(
      "Segera Hadir",
      `Daftar dengan ${provider} akan kami aktifkan di tahap berikutnya.`,
    );
  };

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Data Belum Lengkap",
        "Mohon isi nama, email, nomor telepon, dan password.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Tidak Cocok", "Ulangi konfirmasi password Anda.");
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (!/^\+628\d{8,13}$/.test(normalizedPhoneNumber)) {
      Alert.alert(
        "Nomor Telepon Tidak Valid",
        "Gunakan nomor Indonesia aktif dengan format 08xxxxxxxxxx atau +628xxxxxxxxxx.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert("Password Terlalu Pendek", "Password minimal 8 karakter.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
      Alert.alert(
        "Password Belum Kuat",
        "Password harus mengandung huruf besar, huruf kecil, dan angka.",
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: normalizedPhoneNumber,
      });

      router.replace({
        pathname: "/(auth)/account-setup",
        params: {
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: normalizedPhoneNumber,
          redirectTo,
          reason,
        },
      });
    } catch (error: unknown) {
      const message = extractApiErrorMessage(error);
      Alert.alert("Registrasi Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            <Ionicons name="car-sport" size={28} color={Colors.white} />
          </View>

          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Daftar dengan gaya baru Mediator dan lanjutkan ke setup profil.
          </Text>

          <View style={styles.form}>
            <AuthInputField
              label="Nama Lengkap"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nama lengkap Anda"
              autoCapitalize="words"
              autoComplete="name"
            />
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
              label="Nomor Telepon"
              icon="call-outline"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="08xxxxxxxxxx "
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <AuthInputField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter, huruf besar, kecil, angka"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
              autoComplete="new-password"
            />
            <AuthInputField
              label="Konfirmasi Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi password"
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword((prev) => !prev)}
            />

            <AuthCheckbox
              checked={rememberMe}
              onPress={() => setRememberMe((prev) => !prev)}
              label="Remember me"
            />

            <AuthActionButton
              label="Daftar"
              icon="person-add-outline"
              loading={loading}
              onPress={handleRegister}
              variant="dark"
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau lanjut dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            <AuthSocialButtons onPress={handleSocialPress} />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
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
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 22,
  },
  title: {
    marginTop: 22,
    fontSize: 32,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textTertiary,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },
});
