import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface AuthSocialButtonsProps {
  dark?: boolean;
  onPress: (provider: "facebook" | "google" | "apple") => void;
}

const providers = [
  {
    key: "facebook" as const,
    icon: "logo-facebook" as const,
    color: "#1877F2",
  },
  { key: "google" as const, icon: "logo-google" as const, color: "#EA4335" },
  { key: "apple" as const, icon: "logo-apple" as const, color: "#FFFFFF" },
];

export default function AuthSocialButtons({
  dark = false,
  onPress,
}: AuthSocialButtonsProps) {
  return (
    <View style={styles.row}>
      {providers.map((provider) => (
        <TouchableOpacity
          key={provider.key}
          activeOpacity={0.82}
          onPress={() => onPress(provider.key)}
          style={[styles.button, dark ? styles.buttonDark : styles.buttonLight]}
        >
          <Ionicons
            name={provider.icon}
            size={22}
            color={
              provider.key === "apple" && !dark ? Colors.text : provider.color
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  button: {
    width: 74,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  buttonDark: {
    backgroundColor: Colors.inputFillDark,
    borderColor: Colors.primaryLight,
  },
});
