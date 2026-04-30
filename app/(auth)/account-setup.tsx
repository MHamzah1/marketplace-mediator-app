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
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import AuthActionButton from '@/components/auth/AuthActionButton';
import AuthInputField from '@/components/auth/AuthInputField';
import Colors, { Shadows } from '@/constants/Colors';
import {
  getPendingRegistration,
  mergePendingRegistration,
  PendingRegistrationPhoto,
} from '@/lib/auth/pendingRegistration';

const MIN_BIRTH_YEAR = 1900;
const TODAY = new Date();
const MAX_BIRTH_DATE = toIsoDate(TODAY);
const DEFAULT_BIRTH_MONTH = new Date(
  TODAY.getFullYear() - 25,
  TODAY.getMonth(),
  1,
);

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

LocaleConfig.locales.id = {
  monthNames: MONTH_NAMES,
  monthNamesShort: MONTH_NAMES.map((month) => month.slice(0, 3)),
  dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  today: 'Hari ini',
};
LocaleConfig.defaultLocale = 'id';

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function toCalendarMonthDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-01`;
}

function getInitialCalendarMonth(value: string) {
  const date = parseIsoDate(value);

  if (!date) return DEFAULT_BIRTH_MONTH;

  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isAfterCurrentMonth(year: number, monthIndex: number) {
  return year > TODAY.getFullYear()
    || (year === TODAY.getFullYear() && monthIndex > TODAY.getMonth());
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
  const [calendarMonth, setCalendarMonth] = useState(DEFAULT_BIRTH_MONTH);
  const [calendarMode, setCalendarMode] =
    useState<'day' | 'month' | 'year'>('day');

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
        setCalendarMonth(getInitialCalendarMonth(pending.dateOfBirth));
      }
    });
  }, [params.email]);

  const calendarInitialDate = useMemo(
    () => toCalendarMonthDate(calendarMonth),
    [calendarMonth],
  );

  const birthYears = useMemo(
    () =>
      Array.from(
        { length: TODAY.getFullYear() - MIN_BIRTH_YEAR + 1 },
        (_, index) => TODAY.getFullYear() - index,
      ),
    [],
  );

  const markedDates = useMemo(
    () =>
      dateOfBirth
        ? {
            [dateOfBirth]: {
              selected: true,
              selectedColor: Colors.primary,
              selectedTextColor: Colors.white,
            },
          }
        : {},
    [dateOfBirth],
  );

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: Colors.background,
      textSectionTitleColor: Colors.textTertiary,
      selectedDayBackgroundColor: Colors.primary,
      selectedDayTextColor: Colors.white,
      todayTextColor: Colors.primary,
      dayTextColor: Colors.text,
      monthTextColor: Colors.text,
      arrowColor: Colors.text,
      textDisabledColor: Colors.textTertiary,
      textDayFontWeight: '700' as const,
      textMonthFontWeight: '900' as const,
      textDayHeaderFontWeight: '800' as const,
      textDayFontSize: 15,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 12,
    }),
    [],
  );

  const isAtMinCalendarMonth =
    calendarMonth.getFullYear() === MIN_BIRTH_YEAR && calendarMonth.getMonth() === 0;
  const isAtMaxCalendarMonth =
    calendarMonth.getFullYear() === TODAY.getFullYear()
    && calendarMonth.getMonth() >= TODAY.getMonth();

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

  const openBirthCalendar = () => {
    setCalendarMonth(getInitialCalendarMonth(dateOfBirth));
    setCalendarMode('day');
    setCalendarVisible(true);
  };

  const selectDate = (date: DateData) => {
    setDateOfBirth(date.dateString);
    setCalendarMonth(new Date(date.year, date.month - 1, 1));
    setCalendarVisible(false);
    setCalendarMode('day');
  };

  const selectMonth = (monthIndex: number) => {
    if (isAfterCurrentMonth(calendarMonth.getFullYear(), monthIndex)) return;

    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), monthIndex, 1),
    );
    setCalendarMode('day');
  };

  const selectYear = (year: number) => {
    const month = Math.min(
      calendarMonth.getMonth(),
      year === TODAY.getFullYear() ? TODAY.getMonth() : 11,
    );

    setCalendarMonth(new Date(year, month, 1));
    setCalendarMode('month');
  };

  const handleCalendarMonthChange = (date: DateData) => {
    setCalendarMonth(new Date(date.year, date.month - 1, 1));
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
                onPress={openBirthCalendar}
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
            <View style={styles.calendarTopBar}>
              <Text style={styles.calendarSheetTitle}>Tanggal Lahir</Text>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.calendarCloseButton}
                onPress={() => setCalendarVisible(false)}
              >
                <Ionicons name="close" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {calendarMode === 'day' ? (
              <Calendar
                initialDate={calendarInitialDate}
                minDate={`${MIN_BIRTH_YEAR}-01-01`}
                maxDate={MAX_BIRTH_DATE}
                firstDay={1}
                hideExtraDays
                enableSwipeMonths
                disableArrowLeft={isAtMinCalendarMonth}
                disableArrowRight={isAtMaxCalendarMonth}
                disableAllTouchEventsForDisabledDays
                markedDates={markedDates}
                onDayPress={selectDate}
                onMonthChange={handleCalendarMonthChange}
                renderArrow={(direction) => (
                  <Ionicons
                    name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                    size={20}
                    color={Colors.text}
                  />
                )}
                renderHeader={() => (
                  <View style={styles.calendarTitleRow}>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      style={styles.calendarTitleButton}
                      onPress={() => setCalendarMode('month')}
                    >
                      <Text style={styles.calendarTitleText}>
                        {MONTH_NAMES[calendarMonth.getMonth()]}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={Colors.textTertiary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      style={styles.calendarTitleButton}
                      onPress={() => setCalendarMode('year')}
                    >
                      <Text style={styles.calendarTitleText}>
                        {calendarMonth.getFullYear()}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                theme={calendarTheme}
                style={styles.nativeCalendar}
              />
            ) : calendarMode === 'month' ? (
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((monthName, index) => {
                  const active = index === calendarMonth.getMonth();
                  const disabled = isAfterCurrentMonth(
                    calendarMonth.getFullYear(),
                    index,
                  );

                  return (
                    <TouchableOpacity
                      key={monthName}
                      activeOpacity={0.82}
                      disabled={disabled}
                      style={[
                        styles.pickerTile,
                        active && styles.pickerTileActive,
                        disabled && styles.pickerTileDisabled,
                      ]}
                      onPress={() => selectMonth(index)}
                    >
                      <Text
                        style={[
                          styles.pickerTileText,
                          active && styles.pickerTileTextActive,
                          disabled && styles.pickerTileTextDisabled,
                        ]}
                      >
                        {monthName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <ScrollView
                style={styles.yearList}
                contentContainerStyle={styles.yearGrid}
                showsVerticalScrollIndicator={false}
              >
                {birthYears.map((year) => {
                  const active = year === calendarMonth.getFullYear();

                  return (
                    <TouchableOpacity
                      key={year}
                      activeOpacity={0.82}
                      style={[
                        styles.pickerTile,
                        active && styles.pickerTileActive,
                      ]}
                      onPress={() => selectYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerTileText,
                          active && styles.pickerTileTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <AuthActionButton
              label={calendarMode === 'day' ? 'Tutup' : 'Kembali'}
              onPress={() =>
                calendarMode === 'day'
                  ? setCalendarVisible(false)
                  : setCalendarMode('day')
              }
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
  calendarTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarSheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  calendarCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  nativeCalendar: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calendarTitleButton: {
    minWidth: 92,
    height: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
  },
  calendarTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 2,
  },
  yearList: {
    maxHeight: 302,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 2,
  },
  pickerTile: {
    width: '31%',
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pickerTileActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerTileDisabled: {
    opacity: 0.42,
  },
  pickerTileText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  pickerTileTextActive: {
    color: Colors.white,
  },
  pickerTileTextDisabled: {
    color: Colors.textTertiary,
  },
});
