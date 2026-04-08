import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import GradientHeader from '@/components/ui/GradientHeader';
import {
  getCalculatorOptions,
  getModelsByBrand,
  getVariantsByModel,
  getYearsByVariant,
  calculatePrice,
} from '@/lib/api/calculatorService';
import { formatRupiahFull } from '@/lib/utils';
import type { CalculationResult, Variant } from '@/types';

interface SelectOption {
  id: string;
  label: string;
}

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Options from API
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([]);
  const [modelOptions, setModelOptions] = useState<SelectOption[]>([]);
  const [variantOptions, setVariantOptions] = useState<SelectOption[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  // Selected values
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Condition inputs
  const [transmission, setTransmission] = useState('AT');
  const [ownership, setOwnership] = useState('first');
  const [color, setColor] = useState('common');

  // State
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load brand options
  useEffect(() => {
    getCalculatorOptions()
      .then((data) => {
        setBrandOptions(
          (data.brands || []).map((b) => ({ id: b.id, label: b.name })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  }, []);

  // Load models when brand changes
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
    setYearOptions([]);
    setSelectedYear(null);
    setResult(null);
    getModelsByBrand(selectedBrand)
      .then((data) => {
        setModelOptions(
          (data.models || []).map((m) => ({ id: m.id, label: m.modelName })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  }, [selectedBrand]);

  // Load variants when model changes
  useEffect(() => {
    if (!selectedModel) {
      setVariantOptions([]);
      setSelectedVariant('');
      return;
    }
    setLoadingVariants(true);
    setSelectedVariant('');
    setYearOptions([]);
    setSelectedYear(null);
    setResult(null);
    getVariantsByModel(selectedModel)
      .then((data: Variant[]) => {
        setVariantOptions(
          (data || []).map((v) => ({ id: v.id, label: v.name })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingVariants(false));
  }, [selectedModel]);

  // Load years when variant changes
  useEffect(() => {
    if (!selectedVariant) {
      setYearOptions([]);
      setSelectedYear(null);
      return;
    }
    setLoadingYears(true);
    setSelectedYear(null);
    setResult(null);
    getYearsByVariant(selectedVariant)
      .then((data) => {
        setYearOptions(data.years || []);
      })
      .catch(() => {})
      .finally(() => setLoadingYears(false));
  }, [selectedVariant]);

  const canCalculate = selectedVariant && selectedYear;

  const handleCalculate = async () => {
    if (!canCalculate) return;
    try {
      setCalculating(true);
      setError(null);
      const res = await calculatePrice({
        variantId: selectedVariant,
        year: selectedYear!,
        transmissionCode: transmission,
        ownershipCode: ownership,
        colorCode: color,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghitung harga';
      setError(msg);
    } finally {
      setCalculating(false);
    }
  };

  const transmissionOptions = [
    { code: 'AT', label: 'Automatic' },
    { code: 'MT', label: 'Manual' },
  ];

  const ownershipOptions = [
    { code: 'first', label: 'Tangan 1' },
    { code: 'second', label: 'Tangan 2' },
    { code: 'third_plus', label: 'Tangan 3+' },
  ];

  const colorOptions = [
    { code: 'common', label: 'Umum' },
    { code: 'popular', label: 'Populer' },
    { code: 'rare', label: 'Langka' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <GradientHeader
          title="Kalkulator Harga"
          subtitle="Cek estimasi harga mobil bekas"
          height={140}
        />

        <View style={styles.content}>
          {/* Brand */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="car-sport" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Pilih Mobil</Text>
            </View>

            {loadingOptions ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.fieldLabel}>Merk</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {brandOptions.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.chip, selectedBrand === b.id && styles.chipActive]}
                      onPress={() => setSelectedBrand(b.id)}
                    >
                      <Text style={[styles.chipText, selectedBrand === b.id && styles.chipTextActive]}>
                        {b.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {selectedBrand && (
                  <>
                    <Text style={styles.fieldLabel}>Model</Text>
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
                            <Text style={[styles.chipText, selectedModel === m.id && styles.chipTextActive]}>
                              {m.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </>
                )}

                {selectedModel && (
                  <>
                    <Text style={styles.fieldLabel}>Varian</Text>
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
                            <Text style={[styles.chipText, selectedVariant === v.id && styles.chipTextActive]}>
                              {v.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </>
                )}

                {selectedVariant && (
                  <>
                    <Text style={styles.fieldLabel}>Tahun</Text>
                    {loadingYears ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {yearOptions.map((y) => (
                          <TouchableOpacity
                            key={y}
                            style={[styles.chip, selectedYear === y && styles.chipActive]}
                            onPress={() => setSelectedYear(y)}
                          >
                            <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>
                              {y}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </>
                )}
              </>
            )}
          </View>

          {/* Conditions */}
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="options" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Kondisi</Text>
            </View>

            <Text style={styles.fieldLabel}>Transmisi</Text>
            <View style={styles.chipRow}>
              {transmissionOptions.map((t) => (
                <TouchableOpacity
                  key={t.code}
                  style={[styles.chip, transmission === t.code && styles.chipActive]}
                  onPress={() => setTransmission(t.code)}
                >
                  <Text style={[styles.chipText, transmission === t.code && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Kepemilikan</Text>
            <View style={styles.chipRow}>
              {ownershipOptions.map((o) => (
                <TouchableOpacity
                  key={o.code}
                  style={[styles.chip, ownership === o.code && styles.chipActive]}
                  onPress={() => setOwnership(o.code)}
                >
                  <Text style={[styles.chipText, ownership === o.code && styles.chipTextActive]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Warna</Text>
            <View style={styles.chipRow}>
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.chip, color === c.code && styles.chipActive]}
                  onPress={() => setColor(c.code)}
                >
                  <Text style={[styles.chipText, color === c.code && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCalculate}
            disabled={!canCalculate || calculating}
          >
            <LinearGradient
              colors={canCalculate ? [Colors.gradientStart, Colors.gradientEnd] : ['#94A3B8', '#94A3B8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.calculateBtn, canCalculate && Shadows.blue]}
            >
              {calculating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="calculator" size={22} color={Colors.white} />
                  <Text style={styles.calculateBtnText}>Hitung Harga</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Result */}
          {result && (
            <View style={[styles.resultCard, Shadows.large]}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultHeader}
              >
                <Text style={styles.resultHeaderTitle}>Estimasi Harga Pasar</Text>
                <Text style={styles.finalPrice}>{formatRupiahFull(result.finalPrice)}</Text>
                <Text style={styles.priceRange}>
                  {formatRupiahFull(result.priceRange.min)} - {formatRupiahFull(result.priceRange.max)}
                </Text>
              </LinearGradient>

              <View style={styles.resultBody}>
                {/* Car info */}
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Detail Mobil</Text>
                  <Text style={styles.resultCarName}>
                    {result.car.brandName} {result.car.modelName}
                  </Text>
                  <Text style={styles.resultCarVariant}>
                    {result.car.variantName} · {result.car.year}
                  </Text>
                </View>

                {/* Price breakdown */}
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Rincian Harga</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Harga Dasar</Text>
                    <Text style={styles.breakdownValue}>
                      {formatRupiahFull(result.priceBreakdown.basePrice)}
                    </Text>
                  </View>
                  {result.priceBreakdown.adjustments.map((adj, i) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{adj.name}</Text>
                      <Text
                        style={[
                          styles.breakdownValue,
                          { color: adj.amount >= 0 ? Colors.success : Colors.error },
                        ]}
                      >
                        {adj.amount >= 0 ? '+' : ''}{formatRupiahFull(adj.amount)}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                    <Text style={styles.breakdownTotalLabel}>Total Penyesuaian</Text>
                    <Text style={styles.breakdownTotalValue}>
                      {formatRupiahFull(result.priceBreakdown.totalAdjustments)}
                    </Text>
                  </View>
                </View>

                {result.priceRange.note && (
                  <View style={styles.disclaimer}>
                    <Ionicons name="information-circle" size={16} color={Colors.textTertiary} />
                    <Text style={styles.disclaimerText}>{result.priceRange.note}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
  content: {
    padding: 16,
    marginTop: -12,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
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
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 18,
    marginTop: 4,
  },
  calculateBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
  },
  resultHeader: {
    padding: 24,
    alignItems: 'center',
  },
  resultHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  finalPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 6,
    letterSpacing: -1,
  },
  priceRange: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    fontWeight: '500',
  },
  resultBody: {
    padding: 18,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  resultCarName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  resultCarVariant: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
});
