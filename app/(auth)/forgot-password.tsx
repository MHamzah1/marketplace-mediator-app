import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import Colors from '@/constants/Colors';

type ResetMethod = 'sms' | 'email';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<ResetMethod>('sms');

  const options = [
    {
      id: 'sms' as const,
      icon: 'chatbubble-ellipses-outline' as const,
      title: 'via SMS',
      value: '+62 811 ******99',
    },
    {
      id: 'email' as const,
      icon: 'mail-outline' as const,
      title: 'via Email',
      value: 'mediator****@email.com',
    },
  ];

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

        <View style={styles.illustration}>
          <View style={styles.phoneMock}>
            <Ionicons name="shield-checkmark" size={44} color={Colors.white} />
          </View>
          <View style={styles.sideBubbleLeft}>
            <Ionicons name="lock-closed" size={18} color={Colors.white} />
          </View>
          <View style={styles.sideBubbleRight}>
            <Ionicons name="mail" size={18} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.description}>
          Select which contact detail should we use to reset your password.
        </Text>

        <View style={styles.options}>
          {options.map((option) => {
            const active = method === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.82}
                onPress={() => setMethod(option.id)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={22} color={Colors.white} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionValue}>{option.value}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <AuthActionButton
          label="Continue"
          onPress={() =>
            router.push({
              pathname: '/(auth)/verify-reset',
              params: { method },
            })
          }
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
    marginTop: 22,
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.8,
  },
  illustration: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  phoneMock: {
    width: 114,
    height: 170,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  sideBubbleLeft: {
    position: 'absolute',
    left: 40,
    top: 78,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBubbleRight: {
    position: 'absolute',
    right: 42,
    top: 78,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  options: {
    flex: 1,
    gap: 16,
    marginTop: 28,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: Colors.inputFillDark,
  },
  optionCardActive: {
    borderColor: Colors.white,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.52)',
  },
  optionValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
});
