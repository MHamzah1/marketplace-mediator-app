import React, { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { useTheme } from '@/context/ThemeContext';
import { mergePendingRegistration } from '@/lib/auth/pendingRegistration';

export default function CreatePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ redirectTo?: string; reason?: string }>();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits(next);

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
  const handleContinue = async () => {
    if (!isComplete) return;

    try {
      await mergePendingRegistration({ pin: digits.join('') });
      router.push({
        pathname: '/(auth)/set-fingerprint',
        params: {
          redirectTo: params.redirectTo,
          reason: params.reason,
        },
      });
    } catch {
      Alert.alert('PIN Gagal Disimpan', 'Silakan coba beberapa saat lagi.');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#FFFFFF' ? 'dark' : 'light'} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create New PIN</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Add a PIN number to make your account more secure.
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
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: digit ? colors.text : colors.border,
                  color: colors.text,
                },
              ]}
              value={showPin ? digit : digit ? '*' : ''}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={colors.text}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.showRow} onPress={() => setShowPin((v) => !v)}>
          <Ionicons
            name={showPin ? 'eye-outline' : 'eye-off-outline'}
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.showText, { color: colors.textSecondary }]}>
            {showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <AuthActionButton
          label="Continue"
          disabled={!isComplete}
          onPress={handleContinue}
          variant="dark"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  codeInput: {
    width: 62,
    height: 62,
    borderRadius: 18,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '800',
  },
  showRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  showText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
