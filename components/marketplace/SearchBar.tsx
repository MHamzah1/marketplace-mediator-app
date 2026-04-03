import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors, { Shadows } from '@/constants/Colors';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Cari mobil impian Anda...',
  onPress,
  editable = false,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/search');
    }
  };

  if (!editable) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="search" size={20} color={Colors.primary} />
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
        <View style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="search" size={20} color={Colors.primary} />
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
      {value ? (
        <TouchableOpacity onPress={() => onChangeText?.('')} style={styles.filterButton}>
          <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 4,
    height: 52,
    ...Shadows.medium,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
