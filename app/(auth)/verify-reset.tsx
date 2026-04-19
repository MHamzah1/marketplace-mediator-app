import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import Colors from '@/constants/Colors';

export default function VerifyResetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const nextDigits = [...digits];
    nextDigits[index] = value.slice(-1);
    setDigits(nextDigits);

    if (value && index < refs.current.length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const isComplete = digits.every(Boolean);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.message}>
          Code has been sent to +62 811 ******99
        </Text>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                refs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit && styles.codeInputActive,
              ]}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.white}
            />
          ))}
        </View>

        <Text style={styles.resendText}>Resend code in 55 s</Text>

        <AuthActionButton
          label="Verify"
          disabled={!isComplete}
          onPress={() => router.push('/(auth)/reset-password')}
          variant="light"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.8,
  },
  message: {
    marginTop: 100,
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  codeInput: {
    flex: 1,
    height: 62,
    borderRadius: 18,
    backgroundColor: Colors.inputFillDark,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  codeInputActive: {
    borderColor: Colors.white,
  },
  resendText: {
    marginTop: 32,
    marginBottom: 36,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
  },
});
