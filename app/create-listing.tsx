import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { isAxiosError } from 'axios';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Colors, { Shadows } from '@/constants/Colors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  getCalculatorOptions,
  getModelsByBrand,
  getVariantsByModel,
  getYearsByVariant,
} from '@/lib/api/calculatorService';
import {
  createListing,
  updateListing,
  fetchMyListingDetail,
} from '@/lib/api/marketplaceService';
import { normalizeTransmissionValue } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { redirectToLogin } from '@/lib/auth/requireAuth';
import type { YearPriceOption } from '@/types';

interface SelectOption {
  id: string;
  label: string;
}

type ListingTransmissionValue = 'manual' | 'matic' | 'cvt';

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const isEdit = !!editId;
  const loginRedirectedRef = useRef(false);
  const editPrefillRef = useRef<{
    brandId: string;
    modelId: string;
    variantId: string;
    year: number | null;
    yearPriceId: string;
  } | null>(null);

  // Options
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);
  const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
  const [variantOptions, setVariantOptions] = useState<SelectOption[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [yearPriceOptions, setYearPriceOptions] = useState<YearPriceOption[]>([]);

  // Form
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearPriceId, setYearPriceId] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState<ListingTransmissionValue>('matic');
  const [fuelType, setFuelType] = useState('Bensin');
  const [color, setColor] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationProvince, setLocationProvince] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('bekas');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [images, setImages] = useState<{ uri: string; type: string; name: string }[]>([]);

  // State
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingEditData, setLoadingEditData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget = editId
    ? `/create-listing?editId=${editId}`
    : '/create-listing';

  const normalizeWhatsappNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('62')) {
      return digits;
    }

    if (digits.startsWith('0')) {
      return `62${digits.slice(1)}`;
    }

    if (digits.startsWith('8')) {
      return `62${digits}`;
    }

    return digits;
  };

  const extractApiErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;

      if (Array.isArray(apiMessage)) {
        return apiMessage.join('\n');
      }

      if (typeof apiMessage === 'string') {
        return apiMessage;
      }
    }

    return error instanceof Error ? error.message : 'Gagal menyimpan listing';
  };

  useEffect(() => {
    if (authLoading || isLoggedIn || loginRedirectedRef.current) return;

    loginRedirectedRef.current = true;
    Alert.alert(
      'Login Diperlukan',
      isEdit
        ? 'Masuk dulu untuk mengubah listing Anda.'
        : 'Masuk dulu untuk memasang iklan dan mulai berjualan.',
      [
        {
          text: 'OK',
          onPress: () => redirectToLogin(router, redirectTarget, 'sell', true),
        },
      ],
    );
  }, [authLoading, isEdit, isLoggedIn, redirectTarget, router]);

  useEffect(() => {
    getCalculatorOptions()
      .then((data) => {
        setBrandOptions((data.brands || []).map((b) => ({ id: b.id, label: b.name })));
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    if (isEdit || sellerWhatsapp || !user?.whatsappNumber) return;
    setSellerWhatsapp(user.whatsappNumber);
  }, [isEdit, sellerWhatsapp, user?.whatsappNumber]);

  // Load edit data
  useEffect(() => {
    if (!editId || !isLoggedIn) return;

    setLoadingEditData(true);
    fetchMyListingDetail(editId)
      .then((res) => {
        const listing = res.data;
        if (!listing) return;

        editPrefillRef.current = {
          brandId: listing.carModel?.brand?.id || '',
          modelId: listing.carModelId,
          variantId: listing.variantId || '',
          year: listing.year ?? null,
          yearPriceId: listing.yearPriceId || '',
        };

        setSelectedBrand(listing.carModel?.brand?.id || '');
        setPrice(String(listing.price));
        setMileage(String(listing.mileage));
        const normalizedTransmission = normalizeTransmissionValue(
          listing.transmission,
        );
        setTransmission(
          normalizedTransmission === 'manual' || normalizedTransmission === 'cvt'
            ? normalizedTransmission
            : 'matic',
        );
        setFuelType(listing.fuelType);
        setColor(listing.color);
        setLocationCity(listing.locationCity);
        setLocationProvince(listing.locationProvince);
        setDescription(listing.description);
        setCondition(listing.condition);
        setSellerWhatsapp(listing.sellerWhatsapp || user?.whatsappNumber || '');
      })
      .catch(() => {})
      .finally(() => setLoadingEditData(false));
  }, [editId, isLoggedIn, user?.whatsappNumber]);

  useEffect(() => {
    if (!selectedBrand) {
      setModelOptions([]);
      setSelectedModel('');
      return;
    }
    setLoadingModels(true);
    setSelectedModel('');
    setVariantOptions([]);
    setSelectedVariant('');
    setYearPriceOptions([]);
    setYearOptions([]);
    setSelectedYear(null);
    setYearPriceId('');
    getModelsByBrand(selectedBrand)
      .then((data) => {
        setModelOptions((data.models || []).map((m) => ({ id: m.id, label: m.modelName })));

        if (
          editPrefillRef.current &&
          editPrefillRef.current.brandId === selectedBrand &&
          editPrefillRef.current.modelId
        ) {
          setSelectedModel(editPrefillRef.current.modelId);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  }, [selectedBrand]);

  useEffect(() => {
    if (!selectedModel) {
      setVariantOptions([]);
      setSelectedVariant('');
      return;
    }
    setLoadingVariants(true);
    setSelectedVariant('');
    setYearPriceOptions([]);
    setYearOptions([]);
    setSelectedYear(null);
    setYearPriceId('');
    getVariantsByModel(selectedModel)
      .then((data: { id: string; name: string }[]) => {
        setVariantOptions((data || []).map((v) => ({ id: v.id, label: v.name })));

        if (
          editPrefillRef.current &&
          editPrefillRef.current.modelId === selectedModel &&
          editPrefillRef.current.variantId
        ) {
          setSelectedVariant(editPrefillRef.current.variantId);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVariants(false));
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedVariant) {
      setYearOptions([]);
      setYearPriceOptions([]);
      setSelectedYear(null);
      setYearPriceId('');
      return;
    }
    getYearsByVariant(selectedVariant)
      .then((data) => {
        setYearOptions(data.years || []);
        setYearPriceOptions(data.yearPrices || []);

        if (
          editPrefillRef.current &&
          editPrefillRef.current.variantId === selectedVariant
        ) {
          setSelectedYear(editPrefillRef.current.year);
          setYearPriceId(
            editPrefillRef.current.yearPriceId ||
              data.yearPrices?.find((item) => item.year === editPrefillRef.current?.year)?.id ||
              '',
          );
          editPrefillRef.current = null;
        }
      })
      .catch(() => {});
  }, [selectedVariant]);

  useEffect(() => {
    if (!selectedYear) {
      setYearPriceId('');
      return;
    }

    const matchedYearPrice = yearPriceOptions.find(
      (option) => option.year === selectedYear,
    );

    setYearPriceId(matchedYearPrice?.id || '');
  }, [selectedYear, yearPriceOptions]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `photo-${Date.now()}.jpg`,
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const normalizedWhatsapp = normalizeWhatsappNumber(sellerWhatsapp);
    const trimmedColor = color.trim();
    const trimmedLocationCity = locationCity.trim();
    const trimmedLocationProvince = locationProvince.trim();
    const trimmedDescription = description.trim();

    if (
      !selectedVariant ||
      !yearPriceId ||
      !price ||
      !mileage ||
      !trimmedColor ||
      !trimmedLocationCity ||
      !trimmedLocationProvince ||
      !normalizedWhatsapp
    ) {
      Alert.alert(
        'Data Belum Lengkap',
        'Mohon lengkapi varian, harga, kilometer, warna, kota, provinsi, dan nomor WhatsApp.',
      );
      return;
    }

    if (!/^628\d{8,13}$/.test(normalizedWhatsapp)) {
      Alert.alert('Nomor WhatsApp Tidak Valid', 'Gunakan nomor WhatsApp aktif dengan format 628xxxxxxxxx.');
      return;
    }

    if (trimmedDescription.length < 50) {
      Alert.alert(
        'Deskripsi Terlalu Singkat',
        'Deskripsi listing minimal 50 karakter agar sesuai validasi backend.',
      );
      return;
    }

    if (!isEdit && images.length === 0) {
      Alert.alert('Foto Diperlukan', 'Mohon tambahkan minimal 1 foto');
      return;
    }

    try {
      setSubmitting(true);
      const data: Record<string, string> = {
        variantId: selectedVariant,
        price,
        mileage,
        transmission,
        fuelType,
        color: trimmedColor,
        locationCity: trimmedLocationCity,
        locationProvince: trimmedLocationProvince,
        description: trimmedDescription,
        condition,
        sellerWhatsapp: normalizedWhatsapp,
      };
      if (selectedYear) data.year = String(selectedYear);
      if (yearPriceId) data.yearPriceId = yearPriceId;

      if (isEdit) {
        await updateListing(editId!, data, images.length > 0 ? images : undefined);
        Alert.alert('Berhasil', 'Listing berhasil diperbarui', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createListing(data, images);
        Alert.alert('Berhasil', 'Listing berhasil dibuat', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err);
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const transmissionOptions: { value: ListingTransmissionValue; label: string }[] = [
    { value: 'matic', label: 'Matic' },
    { value: 'manual', label: 'Manual' },
    { value: 'cvt', label: 'CVT' },
  ];
  const fuelOptions = ['Bensin', 'Diesel', 'Listrik', 'Hybrid'];
  const conditionOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'bekas', label: 'Bekas' },
  ];

  if (authLoading || loadingEditData || !isLoggedIn) {
    return (
      <View style={styles.screen}>
        <LoadingSpinner fullScreen message="Menyiapkan form listing..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Listing' : 'Pasang Iklan'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
      >
        {/* Images */}
        <View style={[styles.card, Shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Foto Mobil</Text>
            <Text style={styles.cardSubtitle}>{images.length}/10</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImage} contentFit="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 10 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
                <Text style={styles.addImageText}>Tambah</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Car Selection */}
        <View style={[styles.card, Shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="car-sport" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Data Mobil</Text>
          </View>

          {loadingOptions ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Text style={styles.fieldLabel}>Merk *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {brandOptions.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.chip, selectedBrand === b.id && styles.chipActive]}
                    onPress={() => setSelectedBrand(b.id)}
                  >
                    <Text style={[styles.chipText, selectedBrand === b.id && styles.chipTextActive]}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedBrand && (
                <>
                  <Text style={styles.fieldLabel}>Model *</Text>
                  {loadingModels ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                      {modelOptions.map((m) => (
                        <TouchableOpacity
                          key={m.id}
                          style={[styles.chip, selectedModel === m.id && styles.chipActive]}
                          onPress={() => setSelectedModel(m.id)}
                        >
                          <Text style={[styles.chipText, selectedModel === m.id && styles.chipTextActive]}>{m.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

              {selectedModel && (
                <>
                  <Text style={styles.fieldLabel}>Varian *</Text>
                  {loadingVariants ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                      {variantOptions.map((v) => (
                        <TouchableOpacity
                          key={v.id}
                          style={[styles.chip, selectedVariant === v.id && styles.chipActive]}
                          onPress={() => setSelectedVariant(v.id)}
                        >
                          <Text style={[styles.chipText, selectedVariant === v.id && styles.chipTextActive]}>{v.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

            {yearOptions.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Tahun</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {yearOptions.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[styles.chip, selectedYear === y && styles.chipActive]}
                        onPress={() => setSelectedYear(y)}
                      >
                        <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </>
          )}

          <Text style={styles.fieldLabel}>Kondisi</Text>
          <View style={styles.chipRow}>
            {conditionOptions.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, condition === c.value && styles.chipActive]}
                onPress={() => setCondition(c.value)}
              >
                <Text style={[styles.chipText, condition === c.value && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Transmisi</Text>
          <View style={styles.chipRow}>
            {transmissionOptions.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, transmission === t.value && styles.chipActive]}
                onPress={() => setTransmission(t.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    transmission === t.value && styles.chipTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Bahan Bakar</Text>
          <View style={styles.chipRow}>
            {fuelOptions.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, fuelType === f && styles.chipActive]}
                onPress={() => setFuelType(f)}
              >
                <Text style={[styles.chipText, fuelType === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={[styles.card, Shadows.medium]}>
          <View style={styles.cardHeader}>
            <Ionicons name="create" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Detail</Text>
          </View>

          <Text style={styles.fieldLabel}>Harga (Rp) *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>Rp</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="300000000"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <Text style={styles.fieldLabel}>Kilometer *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={(t) => setMileage(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="15000"
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={styles.inputSuffix}>km</Text>
          </View>

          <Text style={styles.fieldLabel}>Warna *</Text>
          <TextInput
            style={styles.inputFull}
            value={color}
            onChangeText={setColor}
            placeholder="cth: Putih Mutiara"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>Kota *</Text>
          <TextInput
            style={styles.inputFull}
            value={locationCity}
            onChangeText={setLocationCity}
            placeholder="cth: Jakarta Selatan"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>Provinsi *</Text>
          <TextInput
            style={styles.inputFull}
            value={locationProvince}
            onChangeText={setLocationProvince}
            placeholder="cth: DKI Jakarta"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>No. WhatsApp *</Text>
          <TextInput
            style={styles.inputFull}
            value={sellerWhatsapp}
            onChangeText={setSellerWhatsapp}
            placeholder="cth: 6281234567890"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Deskripsi * ({description.trim().length}/50)</Text>
          <TextInput
            style={[styles.inputFull, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Deskripsikan kondisi dan fitur mobil Anda minimal 50 karakter..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.submitBtn, Shadows.blue]}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name={isEdit ? 'checkmark-circle' : 'add-circle'} size={22} color={Colors.white} />
                <Text style={styles.submitBtnText}>
                  {isEdit ? 'Simpan Perubahan' : 'Pasang Iklan'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  imageRow: {
    gap: 10,
  },
  imageThumb: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primarySoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoftest,
  },
  addImageText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  inputSuffix: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  inputFull: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
});
