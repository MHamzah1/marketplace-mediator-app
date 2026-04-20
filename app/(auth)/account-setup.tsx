import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import AuthInputField from '@/components/auth/AuthInputField';
import Colors, { Shadows } from '@/constants/Colors';

export default function AccountSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    fullName?: string;
    email?: string;
    redirectTo?: string;
    reason?: 'whatsapp' | 'sell' | 'manage-listings' | 'protected';
  }>();

  const [fullName, setFullName] = useState(params.fullName || '');
  const [nickName, setNickName] = useState(params.fullName?.split(' ')[0] || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Fill Your Profile</Text>

          <View style={[styles.avatarWrap, Shadows.small]}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={54} color={Colors.textTertiary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="create-outline" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <AuthInputField
              label="Full Name"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nama lengkap"
              autoCapitalize="words"
              autoComplete="name"
            />
            <AuthInputField
              label="Nickname"
              icon="sparkles-outline"
              value={nickName}
              onChangeText={setNickName}
              placeholder="Nama panggilan"
              autoCapitalize="words"
            />
            <AuthInputField
              label="Date of Birth"
              icon="calendar-outline"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
            />
            <AuthInputField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthInputField
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+62 812..."
              keyboardType="phone-pad"
            />

            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['Male', 'Female'] as const).map((option) => {
                  const active = gender === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.82}
                      onPress={() => setGender(option)}
                      style={[
                        styles.genderChip,
                        active && styles.genderChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderChipText,
                          active && styles.genderChipTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AuthActionButton
              label="Continue"
              onPress={() =>
                router.push({
                  pathname: '/(auth)/create-pin',
                  params: {
                    redirectTo: params.redirectTo,
                    reason: params.reason,
                  },
                })
              }
            />
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
  container: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 2,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginTop: 22,
    gap: 16,
  },
  genderSection: {
    gap: 8,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  genderChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  genderChipTextActive: {
    color: Colors.white,
  },
});
