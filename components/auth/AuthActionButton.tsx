import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors, { Shadows } from '@/constants/Colors';

type Variant = 'dark' | 'light' | 'muted';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface AuthActionButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IoniconsName;
  variant?: Variant;
}

export default function AuthActionButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'dark',
}: AuthActionButtonProps) {
  const isDark = variant === 'dark';
  const isLight = variant === 'light';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        isDark && [styles.buttonDark, Shadows.blue],
        isLight && styles.buttonLight,
        variant === 'muted' && styles.buttonMuted,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? Colors.white : Colors.text} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={isDark ? Colors.white : Colors.text}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              { color: isDark ? Colors.white : Colors.text },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDark: {
    backgroundColor: Colors.primary,
  },
  buttonLight: {
    backgroundColor: Colors.white,
  },
  buttonMuted: {
    backgroundColor: Colors.primaryLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
  },
});
