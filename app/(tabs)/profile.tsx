import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors, { Shadows } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { requireAuth } from '@/lib/auth/requireAuth';
import { resolveImageUrl } from '@/lib/utils';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  color: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const profilePhotoUri = resolveImageUrl(user?.profilePhoto || user?.profileImage);

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Akun',
      items: [
        {
          icon: 'person-circle-outline',
          label: 'Edit Profil',
          subtitle: 'Ubah data akun Anda',
          color: Colors.primary,
          onPress: () => {
            if (
              !requireAuth(router, isLoggedIn, {
                redirectTo: '/edit-profile',
                reason: 'protected',
                message: 'Masuk dulu untuk mengubah profil Anda.',
              })
            ) {
              return;
            }
            router.push('/edit-profile');
          },
        },
        {
          icon: 'car-outline',
          label: 'Listing Saya',
          subtitle: 'Kelola iklan mobil Anda',
          color: Colors.primary,
          onPress: () => {
            if (
              !requireAuth(router, isLoggedIn, {
                redirectTo: '/my-listings',
                reason: 'manage-listings',
                message: 'Masuk dulu untuk melihat dan mengelola listing Anda.',
              })
            ) {
              return;
            }
            router.push('/my-listings');
          },
        },
        {
          icon: 'add-circle-outline',
          label: 'Pasang Iklan',
          subtitle: 'Jual mobil Anda',
          color: Colors.success,
          onPress: () => {
            if (
              !requireAuth(router, isLoggedIn, {
                redirectTo: '/create-listing',
                reason: 'sell',
                message: 'Masuk dulu untuk memasang iklan dan mulai berjualan.',
              })
            ) {
              return;
            }
            router.push('/create-listing');
          },
        },
        {
          icon: 'heart-outline',
          label: 'Favorit Saya',
          subtitle: 'Mobil yang Anda simpan',
          color: '#E11D48',
        },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Bantuan',
          subtitle: 'FAQ & pusat bantuan',
          color: Colors.primary,
        },
        {
          icon: 'document-text-outline',
          label: 'Syarat & Ketentuan',
          color: Colors.textSecondary,
        },
        {
          icon: 'information-circle-outline',
          label: 'Tentang Aplikasi',
          subtitle: 'Versi 1.0.0',
          color: Colors.textSecondary,
        },
      ],
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {isLoggedIn && user ? (
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {profilePhotoUri ? (
                    <Image
                      source={{ uri: profilePhotoUri }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phoneNumber && (
                <View style={styles.phoneBadge}>
                  <Ionicons name="call" size={12} color={Colors.white} />
                  <Text style={styles.phoneText}>{user.phoneNumber}</Text>
                </View>
              )}
              {user.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name="person" size={36} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
              <Text style={styles.userName}>Selamat Datang</Text>
              <Text style={styles.userEmail}>Masuk untuk pengalaman lengkap</Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginBtnText}>Masuk / Daftar</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Quick Stats */}
        {isLoggedIn && (
          <View style={styles.statsRow}>
            {[
              { label: 'Listing', icon: 'car' as IoniconsName, onPress: () => router.push('/my-listings') },
              { label: 'Kalkulator', icon: 'calculator' as IoniconsName, onPress: () => router.push('/(tabs)/calculator') },
              { label: 'Inspeksi', icon: 'shield-checkmark' as IoniconsName, onPress: () => router.push('/(tabs)/inspection') },
            ].map((stat, i) => (
              <TouchableOpacity key={i} style={[styles.statCard, Shadows.small]} onPress={stat.onPress} activeOpacity={0.7}>
                <View style={styles.statIconBg}>
                  <Ionicons name={stat.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, si) => (
            <View key={si} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <View style={[styles.menuCard, Shadows.small]}>
                {section.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    style={[
                      styles.menuItem,
                      ii < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    activeOpacity={0.6}
                    onPress={item.onPress}
                  >
                    <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.subtitle && (
                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Preferences */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Preferensi</Text>
            <View style={[styles.menuCard, Shadows.small]}>
              <View style={styles.menuItem}>
                <View style={[styles.menuIconBg, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Dark Mode</Text>
                  <Text style={styles.menuSubtitle}>
                    {isDark ? 'Tema gelap aktif' : 'Tema terang aktif'}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
          </View>

          {/* Logout Button */}
          {isLoggedIn && (
            <TouchableOpacity
              style={[styles.logoutBtn, Shadows.small]}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.gradientMiddle,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 4,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  loginBtn: {
    marginTop: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: -16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  menuContainer: {
    padding: 16,
    gap: 18,
  },
  menuSection: {
    gap: 8,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.errorLight,
    paddingVertical: 16,
    borderRadius: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.error,
  },
});
