import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import AuthInputField from '@/components/auth/AuthInputField';
import Colors, { Shadows } from '@/constants/Colors';
import {
  getPendingRegistration,
  mergePendingRegistration,
  PendingRegistrationPhoto,
} from '@/lib/auth/pendingRegistration';

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `+62${digits}`;

  return value.trim();
}

function toWhatsappNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, '').replace(/^0/, '62');
}

export default function AccountSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    email?: string;
    redirectTo?: string;
    reason?: 'whatsapp' | 'sell' | 'manage-listings' | 'protected';
  }>();

  const [fullName, setFullName] = useState('');
  const [nickName, setNickName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [profilePhoto, setProfilePhoto] =
    useState<PendingRegistrationPhoto | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    getPendingRegistration().then((pending) => {
      setEmail(params.email || pending.email || '');
      setFullName(pending.fullName || '');
      setNickName(pending.nickName || '');
      setDateOfBirth(pending.dateOfBirth || '');
      setPhone(pending.phoneNumber || '');
      setLocation(pending.location || '');
      setGender(pending.gender === 'Female' ? 'Female' : 'Male');
      setProfilePhoto(pending.profilePhoto || null);

      if (pending.dateOfBirth) {
        setCalendarMonth(new Date(pending.dateOfBirth));
      }
    });
  }, [params.email]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const blanks = Array.from({ length: firstDay.getDay() }, () => null);
    const days = Array.from(
      { length: lastDate },
      (_, index) => new Date(year, month, index + 1),
    );
    return [...blanks, ...days];
  }, [calendarMonth]);

  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setProfilePhoto({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `profile-${Date.now()}.jpg`,
    });
  };

  const selectDate = (date: Date) => {
    setDateOfBirth(toIsoDate(date));
    setCalendarVisible(false);
  };

  const moveMonth = (delta: number) => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  const handleContinue = async () => {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!fullName.trim() || !normalizedPhone || !dateOfBirth) {
      Alert.alert(
        'Data Belum Lengkap',
        'Mohon isi nama lengkap, nomor telepon, dan tanggal lahir.',
      );
      return;
    }

    if (!/^\+628\d{8,13}$/.test(normalizedPhone)) {
      Alert.alert(
        'Nomor Telepon Tidak Valid',
        'Gunakan nomor Indonesia aktif dengan format 08xxxxxxxxxx atau +628xxxxxxxxxx.',
      );
      return;
    }

    await mergePendingRegistration({
      fullName: fullName.trim(),
      nickName: nickName.trim() || fullName.trim().split(' ')[0],
      email,
      phoneNumber: normalizedPhone,
      whatsappNumber: toWhatsappNumber(normalizedPhone),
      location: location.trim(),
      dateOfBirth,
      gender,
      profilePhoto: profilePhoto || undefined,
    });

    router.push({
      pathname: '/(auth)/create-pin',
      params: {
        redirectTo: params.redirectTo,
        reason: params.reason,
      },
    });
  };

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

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.avatarWrap, Shadows.small]}
            onPress={pickProfilePhoto}
          >
            <View style={styles.avatarCircle}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto.uri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={54} color={Colors.textTertiary} />
              )}
            </View>
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera-outline" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>

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

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Date of Birth</Text>
              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.dateButton}
                onPress={() => setCalendarVisible(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.dateButtonText,
                    !dateOfBirth && styles.datePlaceholder,
                  ]}
                >
                  {dateOfBirth ? formatDateLabel(dateOfBirth) : 'Pilih tanggal lahir'}
                </Text>
              </TouchableOpacity>
            </View>

            <AuthInputField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoComplete="email"
              editable={false}
            />
            <AuthInputField
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+62 812..."
              keyboardType="phone-pad"
            />
            <AuthInputField
              label="Location"
              icon="location-outline"
              value={location}
              onChangeText={setLocation}
              placeholder="Jakarta Selatan"
              autoCapitalize="words"
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

            <AuthActionButton label="Continue" onPress={handleContinue} />
          </View>
        </View>
      </ScrollView>

      <Modal visible={calendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.calendarSheet,
              { paddingBottom: insets.bottom + 18 },
              Shadows.large,
            ]}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarIconButton}
                onPress={() => moveMonth(-1)}
              >
                <Ionicons name="chevron-back" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {calendarMonth.toLocaleString('id-ID', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity
                style={styles.calendarIconButton}
                onPress={() => moveMonth(1)}
              >
                <Ionicons name="chevron-forward" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {calendarDays.map((day, index) => {
                const active = day ? toIsoDate(day) === dateOfBirth : false;
                return (
                  <TouchableOpacity
                    key={day ? toIsoDate(day) : `blank-${index}`}
                    disabled={!day}
                    activeOpacity={0.82}
                    onPress={() => day && selectDate(day)}
                    style={[
                      styles.dayButton,
                      active && styles.dayButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        active && styles.dayTextActive,
                      ]}
                    >
                      {day ? day.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AuthActionButton
              label="Tutup"
              onPress={() => setCalendarVisible(false)}
              variant="light"
            />
          </View>
        </View>
      </Modal>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  dateField: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dateButton: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  datePlaceholder: {
    color: Colors.textTertiary,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  calendarSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayButton: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  dayTextActive: {
    color: Colors.white,
  },
});
