import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { Shadows } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/constants/Config";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Mohon isi email dan password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/marketplace");
    } catch (error: any) {
      console.log("[LOGIN_ERROR]", {
        apiBaseUrl: API_BASE_URL,
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message,
      });

      Alert.alert(
        "Login Gagal",
        error?.response?.data?.message ||
          (error?.request
            ? `Tidak dapat terhubung ke server ${API_BASE_URL}. Jika memakai Expo Go di HP, gunakan IP laptop, bukan localhost.`
            : "Email atau password salah"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Gradient */}
        <LinearGradient
          colors={[
            Colors.gradientStart,
            Colors.gradientMiddle,
            Colors.gradientEnd,
          ]}
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

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="car-sport" size={36} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.brandTitle}>Mediator</Text>
          <Text style={styles.brandSubtitle}>Marketplace Mobil Terpercaya</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formSection}>
          <View style={[styles.formCard, Shadows.large]}>
            <Text style={styles.formTitle}>Masuk</Text>
            <Text style={styles.formSubtitle}>
              Selamat datang kembali! Masuk ke akun Anda
            </Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nama@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.loginBtn, Shadows.blue]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="log-in-outline"
                      size={22}
                      color={Colors.white}
                    />
                    <Text style={styles.loginBtnText}>Masuk</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              {[
                { icon: "logo-google" as const, color: "#DB4437" },
                { icon: "logo-apple" as const, color: "#000000" },
              ].map((social, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.socialBtn, Shadows.small]}
                >
                  <Ionicons name={social.icon} size={24} color={social.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
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
    paddingBottom: 48,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginTop: 4,
  },
  formSection: {
    padding: 16,
    marginTop: -28,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 18,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textTertiary,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },
});
