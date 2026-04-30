import React, { useCallback, useState } from "react";
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
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";
import Colors from "@/constants/Colors";
import {
  requestRegisterEmail,
  verifyRegisterOtp,
} from "@/lib/api/authRegistrationService";
import {
  clearPendingRegistration,
  mergePendingRegistration,
} from "@/lib/auth/pendingRegistration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

type RegisterStep = "email" | "otp" | "password";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { redirectTo, reason } = useLocalSearchParams<{
    redirectTo?: string;
    reason?: "whatsapp" | "sell" | "manage-listings" | "protected";
  }>();

  const [step, setStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const targetRoute =
    typeof redirectTo === "string" && redirectTo.length > 0
      ? redirectTo
      : "/(tabs)/marketplace";

  const handleGoogleSuccess = useCallback(() => {
    void clearPendingRegistration();
    router.replace(targetRoute as never);
  }, [router, targetRoute]);

  const { loading: googleLoading, startGoogleAuth } = useGoogleAuth({
    action: "Daftar",
    onSuccess: handleGoogleSuccess,
  });

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
    if (provider === "google") {
      startGoogleAuth();
      return;
    }

    Alert.alert(
      "Segera Hadir",
      `Daftar dengan ${provider} akan kami aktifkan di tahap berikutnya.`,
    );
  };

  const requestOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Email Tidak Valid", "Masukkan email aktif Anda.");
      return;
    }

    try {
      setLoading(true);
      await clearPendingRegistration();
      const response = await requestRegisterEmail(normalizedEmail);
      setStep("otp");

      if (response.devOtp) {
        Alert.alert(
          "OTP Development",
          `SMTP belum aktif. Gunakan OTP berikut untuk testing: ${response.devOtp}`,
        );
      } else {
        Alert.alert("OTP Terkirim", "Cek email Anda untuk kode OTP.");
      }
    } catch (error: unknown) {
      Alert.alert("Gagal Mengirim OTP", extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("OTP Tidak Valid", "Masukkan 6 digit kode OTP dari email.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyRegisterOtp(normalizedEmail, otp);
      await mergePendingRegistration({
        email: normalizedEmail,
        verificationToken: response.verificationToken,
      });
      setStep("password");
    } catch (error: unknown) {
      Alert.alert("Verifikasi Gagal", extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const savePasswordAndContinue = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Password Tidak Cocok", "Ulangi konfirmasi password Anda.");
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

    await mergePendingRegistration({ password });
    router.push({
      pathname: "/(auth)/account-setup",
      params: {
        email: normalizedEmail,
        redirectTo,
        reason,
      },
    });
  };

  const stepMeta = {
    email: {
      title: "Daftar Marketplace",
      subtitle:
        "Masukkan email aktif terlebih dahulu. Kami akan mengirim OTP untuk memastikan email ini milik Anda.",
      button: "Kirim OTP",
      icon: "mail-outline" as const,
      action: requestOtp,
    },
    otp: {
      title: "Verifikasi Email",
      subtitle:
        "Masukkan kode 6 digit yang dikirim ke email Anda untuk melanjutkan pembuatan akun.",
      button: "Verifikasi OTP",
      icon: "shield-checkmark-outline" as const,
      action: verifyOtp,
    },
    password: {
      title: "Buat Password",
      subtitle:
        "Gunakan password yang kuat sebelum lanjut mengisi profil marketplace Anda.",
      button: "Lanjut Isi Profil",
      icon: "lock-closed-outline" as const,
      action: savePasswordAndContinue,
    },
  }[step];

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
            onPress={() => (step === "email" ? router.back() : setStep("email"))}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name={stepMeta.icon} size={28} color={Colors.white} />
          </View>

          <Text style={styles.title}>{stepMeta.title}</Text>
          <Text style={styles.subtitle}>{stepMeta.subtitle}</Text>

          <View style={styles.progressRow}>
            {(["email", "otp", "password"] as RegisterStep[]).map((item) => (
              <View
                key={item}
                style={[
                  styles.progressDot,
                  item === step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.form}>
            {step === "email" ? (
              <AuthInputField
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                keyboardType="email-address"
                autoComplete="email"
              />
            ) : null}

            {step === "otp" ? (
              <>
                <AuthInputField
                  label="Kode OTP"
                  icon="keypad-outline"
                  value={otp}
                  onChangeText={(value) =>
                    setOtp(value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  placeholder="6 digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity onPress={requestOtp} disabled={loading}>
                  <Text style={styles.resendText}>Kirim ulang OTP</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {step === "password" ? (
              <>
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
              </>
            ) : null}

            <AuthActionButton
              label={stepMeta.button}
              icon={stepMeta.icon}
              loading={loading}
              onPress={stepMeta.action}
              variant="dark"
            />

            {step === "email" ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau lanjut dengan</Text>
                  <View style={styles.dividerLine} />
                </View>

                <AuthSocialButtons
                  disabled={loading || googleLoading}
                  onPress={handleSocialPress}
                />

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Sudah punya akun?</Text>
                  <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                    <Text style={styles.footerLink}>Masuk</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
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
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  progressRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  progressDot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  resendText: {
    alignSelf: "flex-end",
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
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
