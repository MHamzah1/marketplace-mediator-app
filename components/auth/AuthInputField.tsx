import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface AuthInputFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: IoniconsName;
  label?: string;
  dark?: boolean;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
  editable?: boolean;
  maxLength?: number;
}

export default function AuthInputField({
  value,
  onChangeText,
  placeholder,
  icon,
  label,
  dark = false,
  secureTextEntry = false,
  onToggleSecure,
  keyboardType = "default",
  autoComplete,
  autoCapitalize = "none",
  editable = true,
  maxLength,
}: AuthInputFieldProps) {
  return (
    <View style={styles.field}>
      {label ? (
        <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
      ) : null}
      <View style={[styles.wrapper, dark && styles.wrapperDark]}>
        <Ionicons
          name={icon}
          size={18}
          color={dark ? "rgba(255,255,255,0.65)" : Colors.textTertiary}
        />
        <TextInput
          style={[styles.input, dark && styles.inputDark]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            dark ? "rgba(255,255,255,0.32)" : Colors.textTertiary
          }
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
        />
        {onToggleSecure ? (
          <TouchableOpacity onPress={onToggleSecure}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={dark ? "rgba(255,255,255,0.65)" : Colors.textTertiary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  labelDark: {
    color: "rgba(255,255,255,0.82)",
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  wrapperDark: {
    backgroundColor: Colors.inputFillDark,
    borderColor: Colors.primaryLight,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  inputDark: {
    color: Colors.white,
  },
});
