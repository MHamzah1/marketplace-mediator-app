import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors, { Shadows } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

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
          icon: 'person-outline',
          label: 'Edit Profil',
          subtitle: 'Ubah informasi pribadi',
          color: Colors.primary,
        },
        {
          icon: 'heart-outline',
          label: 'Favorit Saya',
          subtitle: 'Mobil yang Anda simpan',
          color: '#E11D48',
        },
        {
          icon: 'time-outline',
          label: 'Riwayat Inspeksi',
          subtitle: 'Lihat hasil inspeksi',
          color: Colors.accent,
        },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifikasi',
          subtitle: 'Atur preferensi notifikasi',
          color: '#F59E0B',
        },
        {
          icon: 'shield-outline',
          label: 'Keamanan',
          subtitle: 'Password & autentikasi',
          color: '#10B981',
        },
        {
          icon: 'language-outline',
          label: 'Bahasa',
          subtitle: 'Indonesia',
          color: '#8B5CF6',
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
                  <Text style={styles.avatarText}>
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phone && (
                <View style={styles.phoneBadge}>
                  <Ionicons name="call" size={12} color={Colors.white} />
                  <Text style={styles.phoneText}>{user.phone}</Text>
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
              { num: '0', label: 'Favorit', icon: 'heart' as const },
              { num: '0', label: 'Inspeksi', icon: 'shield-checkmark' as const },
              { num: '0', label: 'Listing', icon: 'car' as const },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, Shadows.small]}>
                <Ionicons name={stat.icon} size={22} color={Colors.primary} />
                <Text style={styles.statNum}>{stat.num}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
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

  // Stats
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
    gap: 4,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },

  // Menu
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
