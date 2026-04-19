import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface AuthCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  dark?: boolean;
}

export default function AuthCheckbox({
  checked,
  onPress,
  label,
  dark = false,
}: AuthCheckboxProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.75} onPress={onPress}>
      <View
        style={[
          styles.box,
          dark && styles.boxDark,
          checked && styles.boxChecked,
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
      </View>
      <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDark: {
    backgroundColor: Colors.inputFillDark,
    borderColor: Colors.primaryLight,
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.72)',
  },
});
