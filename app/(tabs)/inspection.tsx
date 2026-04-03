import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import GradientHeader from '@/components/ui/GradientHeader';
import { INSPECTION_PACKAGES } from '@/constants/Config';

type Step = 'packages' | 'form' | 'success';

export default function InspectionScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('packages');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    plateNumber: '',
    location: '',
    phone: '',
  });

  const selectedPkg = INSPECTION_PACKAGES.find((p) => p.id === selectedPackage);

  const handleSelectPackage = (id: string) => {
    setSelectedPackage(id);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!formData.brand || !formData.model || !formData.plateNumber || !formData.location || !formData.phone) {
      Alert.alert('Data Belum Lengkap', 'Mohon lengkapi semua data kendaraan');
      return;
    }
    setStep('success');
  };

  const handleReset = () => {
    setStep('packages');
    setSelectedPackage(null);
    setFormData({ brand: '', model: '', year: '', plateNumber: '', location: '', phone: '' });
  };

  const renderPackages = () => (
    <View style={styles.content}>
      {/* Stats Banner */}
      <View style={[styles.statsBanner, Shadows.medium]}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBannerBg}
        >
          {[
            { num: '500+', label: 'Inspeksi' },
            { num: '50+', label: 'Inspektor' },
            { num: '98%', label: 'Puas' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </LinearGradient>
      </View>

      {/* How it works */}
      <View style={[styles.card, Shadows.medium]}>
        <Text style={styles.sectionTitle}>Cara Kerja</Text>
        <View style={styles.stepsContainer}>
          {[
            { icon: 'list' as const, title: 'Pilih Paket', desc: 'Sesuai kebutuhan Anda' },
            { icon: 'create' as const, title: 'Isi Data', desc: 'Kendaraan & lokasi' },
            { icon: 'calendar' as const, title: 'Jadwalkan', desc: 'Pilih waktu inspeksi' },
            { icon: 'document-text' as const, title: 'Terima Laporan', desc: 'Laporan digital lengkap' },
          ].map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepIconWrapper}>
                <View style={[styles.stepIcon, { backgroundColor: Colors.primarySoft }]}>
                  <Ionicons name={s.icon} size={20} color={Colors.primary} />
                </View>
                {i < 3 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Package Cards */}
      <Text style={styles.sectionTitle}>Pilih Paket Inspeksi</Text>
      {INSPECTION_PACKAGES.map((pkg) => (
        <TouchableOpacity
          key={pkg.id}
          activeOpacity={0.85}
          onPress={() => handleSelectPackage(pkg.id)}
          style={[
            styles.packageCard,
            Shadows.medium,
            pkg.popular && styles.packageCardPopular,
          ]}
        >
          {pkg.popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={12} color={Colors.white} />
              <Text style={styles.popularText}>Paling Populer</Text>
            </View>
          )}
          <View style={styles.pkgHeader}>
            <View>
              <Text style={styles.pkgName}>{pkg.name}</Text>
              <Text style={styles.pkgDuration}>
                <Ionicons name="time-outline" size={13} color={Colors.textTertiary} /> {pkg.duration}
              </Text>
            </View>
            <View style={styles.pkgPriceContainer}>
              <Text style={styles.pkgPrice}>
                Rp {(pkg.price / 1000).toFixed(0)}rb
              </Text>
            </View>
          </View>
          <View style={styles.pkgCheckpoints}>
            <Text style={styles.pkgPointsBadge}>{pkg.points} Titik Pengecekan</Text>
          </View>
          <View style={styles.featureList}>
            {pkg.features.map((feat, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
          <LinearGradient
            colors={pkg.popular ? [Colors.gradientStart, Colors.gradientEnd] : [Colors.primaryLight, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectBtn}
          >
            <Text style={styles.selectBtnText}>Pilih Paket {pkg.name}</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderForm = () => (
    <View style={styles.content}>
      <TouchableOpacity onPress={() => setStep('packages')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        <Text style={styles.backBtnText}>Kembali</Text>
      </TouchableOpacity>

      {selectedPkg && (
        <View style={[styles.selectedPkgBanner, Shadows.small]}>
          <View style={styles.selectedPkgIcon}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedPkgName}>Paket {selectedPkg.name}</Text>
            <Text style={styles.selectedPkgPrice}>Rp {selectedPkg.price.toLocaleString('id-ID')}</Text>
          </View>
        </View>
      )}

      <View style={[styles.card, Shadows.medium]}>
        <Text style={styles.formSectionTitle}>Data Kendaraan</Text>
        {[
          { key: 'brand', label: 'Merk Mobil', placeholder: 'cth: Toyota', icon: 'car' as const },
          { key: 'model', label: 'Model', placeholder: 'cth: Fortuner', icon: 'pricetag' as const },
          { key: 'year', label: 'Tahun', placeholder: 'cth: 2023', icon: 'calendar' as const, keyboard: 'numeric' as const },
          { key: 'plateNumber', label: 'Nomor Plat', placeholder: 'cth: B 1234 XYZ', icon: 'card' as const },
          { key: 'location', label: 'Lokasi Inspeksi', placeholder: 'cth: Jakarta Selatan', icon: 'location' as const },
          { key: 'phone', label: 'No. WhatsApp', placeholder: 'cth: 08123456789', icon: 'call' as const, keyboard: 'phone-pad' as const },
        ].map((field) => (
          <View key={field.key} style={styles.formField}>
            <Text style={styles.formLabel}>{field.label}</Text>
            <View style={styles.formInputWrapper}>
              <Ionicons name={field.icon} size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.formInput}
                value={formData[field.key as keyof typeof formData]}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, [field.key]: text }))
                }
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textTertiary}
                keyboardType={field.keyboard || 'default'}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.submitBtn, Shadows.blue]}
        >
          <Ionicons name="shield-checkmark" size={22} color={Colors.white} />
          <Text style={styles.submitBtnText}>Ajukan Inspeksi</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={[styles.successCard, Shadows.large]}>
        <View style={styles.successIconBg}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Pengajuan Berhasil!</Text>
        <Text style={styles.successDesc}>
          Permintaan inspeksi Anda telah kami terima. Tim kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi jadwal.
        </Text>
        <View style={styles.successInfo}>
          <View style={styles.successInfoRow}>
            <Text style={styles.successInfoLabel}>Paket</Text>
            <Text style={styles.successInfoValue}>{selectedPkg?.name}</Text>
          </View>
          <View style={styles.successInfoRow}>
            <Text style={styles.successInfoLabel}>Kendaraan</Text>
            <Text style={styles.successInfoValue}>{formData.brand} {formData.model}</Text>
          </View>
          <View style={styles.successInfoRow}>
            <Text style={styles.successInfoLabel}>Plat</Text>
            <Text style={styles.successInfoValue}>{formData.plateNumber}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={handleReset}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.successBtn}
          >
            <Text style={styles.successBtnText}>Kembali ke Beranda</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <GradientHeader
          title="Jasa Inspeksi"
          subtitle="Inspeksi profesional sebelum membeli"
          height={140}
        />
        {step === 'packages' && renderPackages()}
        {step === 'form' && renderForm()}
        {step === 'success' && renderSuccess()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 14,
    marginTop: -12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  // Stats
  statsBanner: { borderRadius: 20, overflow: 'hidden' },
  statsBannerBg: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: Colors.white },
  statLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Steps
  stepsContainer: { marginTop: 12 },
  stepItem: { flexDirection: 'row', gap: 14 },
  stepIconWrapper: { alignItems: 'center' },
  stepIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.primarySoft, marginVertical: 4 },
  stepTextWrapper: { flex: 1, paddingBottom: 18 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  stepDesc: { fontSize: 13, color: Colors.textTertiary, marginTop: 2, fontWeight: '500' },

  // Packages
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomLeftRadius: 14,
  },
  popularText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgName: { fontSize: 22, fontWeight: '900', color: Colors.text },
  pkgDuration: { fontSize: 13, color: Colors.textTertiary, fontWeight: '500', marginTop: 4 },
  pkgPriceContainer: { alignItems: 'flex-end' },
  pkgPrice: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  pkgCheckpoints: { marginTop: 12 },
  pkgPointsBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primarySoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  featureList: { marginTop: 16, gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    marginTop: 18,
  },
  selectBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },

  // Form
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  selectedPkgBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.primarySoftest,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
  },
  selectedPkgIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPkgName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  selectedPkgPrice: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  formSectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  formField: { marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  formInput: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
  },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: Colors.white },

  // Success
  successContainer: { padding: 16, marginTop: -12 },
  successCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  successIconBg: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: Colors.text },
  successDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    fontWeight: '500',
  },
  successInfo: {
    width: '100%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  successInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  successInfoLabel: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary },
  successInfoValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  successBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },
});
