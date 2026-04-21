import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors, { Shadows } from "@/constants/Colors";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Cari mobil impian Anda...",
  onPress,
  editable = false,
  autoFocus = false,
  showFilterButton = true,
  onFilterPress,
}: SearchBarProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/search");
    }
  };

  if (!editable) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.searchRow}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={18} color={Colors.textTertiary} />
          </View>
          <View style={styles.textContainer}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={Colors.textTertiary}
              editable={false}
              pointerEvents="none"
            />
          </View>
        </TouchableOpacity>
        {showFilterButton ? (
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.trailingButton}
            onPress={onFilterPress ?? handlePress}
          >
            <Ionicons name="options-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {showFilterButton ? (
        <TouchableOpacity onPress={onFilterPress} style={styles.trailingButton}>
          <Ionicons name="options-outline" size={18} color={Colors.text} />
        </TouchableOpacity>
      ) : value ? (
        <TouchableOpacity
          onPress={() => onChangeText?.("")}
          style={styles.trailingButton}
        >
          <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputFill,
    borderRadius: 18,
    paddingHorizontal: 6,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.small,
  },
  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
  },
  trailingButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: Colors.white,
  },
});
