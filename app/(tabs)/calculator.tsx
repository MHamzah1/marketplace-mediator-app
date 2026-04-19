import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientHeader from '@/components/ui/GradientHeader';
import SearchableSelectField, {
  SearchableSelectOption,
} from '@/components/ui/SearchableSelectField';
import Colors, { Shadows } from '@/constants/Colors';
import { PAGINATION } from '@/constants/Config';
import {
  calculatePrice,
  getCalculatorBrands,
  getCalculatorModels,
  getCalculatorVariants,
  getCalculatorYearPrices,
  getPriceAdjustmentsByModel,
} from '@/lib/api/calculatorService';
import { formatRupiahFull } from '@/lib/utils';
import type { CalculationResult, PriceAdjustmentOption } from '@/types';

interface CalculatorSelectOption extends SearchableSelectOption {
  code?: string;
  year?: number;
  basePrice?: number;
  adjustmentValue?: number;
  colorHex?: string;
  isBaseline?: boolean;
}

interface PagedSelectState {
  items: CalculatorSelectOption[];
  page: number;
  totalPages: number;
  loading: boolean;
  loadingMore: boolean;
}

const SELECT_PAGE_SIZE = PAGINATION.defaultPageSize;

function createPagedState(): PagedSelectState {
  return {
    items: [],
    page: 1,
    totalPages: 1,
    loading: false,
    loadingMore: false,
  };
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function mergeOptions(
  currentItems: CalculatorSelectOption[],
  nextItems: CalculatorSelectOption[],
) {
  const nextMap = new Map<string, CalculatorSelectOption>();

  [...currentItems, ...nextItems].forEach((item) => {
    nextMap.set(item.id, item);
  });

  return Array.from(nextMap.values());
}

function formatAdjustmentHint(amount: number) {
  if (amount === 0) {
    return 'Tanpa penyesuaian harga';
  }

  const formatted = formatRupiahFull(Math.abs(amount));
  return amount > 0 ? `Tambah ${formatted}` : `Kurang ${formatted}`;
}

function mapAdjustmentOptions(options: PriceAdjustmentOption[]) {
  return options.map((option) => ({
    id: option.id,
    label: option.name,
    subtitle: formatAdjustmentHint(option.adjustmentValue),
    code: option.code,
    adjustmentValue: option.adjustmentValue,
    colorHex: option.colorHex,
    isBaseline: option.isBaseline,
  }));
}

function pickDefaultAdjustment(options: CalculatorSelectOption[]) {
  return options.find((option) => option.isBaseline) || options[0] || null;
}

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();

  const [brandState, setBrandState] = useState<PagedSelectState>(createPagedState);
  const [modelState, setModelState] = useState<PagedSelectState>(createPagedState);
  const [variantState, setVariantState] = useState<PagedSelectState>(createPagedState);
  const [yearState, setYearState] = useState<PagedSelectState>(createPagedState);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [variantSearch, setVariantSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');

  const debouncedBrandSearch = useDebouncedValue(brandSearch);
  const debouncedModelSearch = useDebouncedValue(modelSearch);
  const debouncedVariantSearch = useDebouncedValue(variantSearch);
  const debouncedYearSearch = useDebouncedValue(yearSearch);

  const [selectedBrand, setSelectedBrand] = useState<CalculatorSelectOption | null>(
    null,
  );
  const [selectedModel, setSelectedModel] = useState<CalculatorSelectOption | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<CalculatorSelectOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<CalculatorSelectOption | null>(
    null,
  );

  const [ownershipOptions, setOwnershipOptions] = useState<CalculatorSelectOption[]>(
    [],
  );
  const [colorOptions, setColorOptions] = useState<CalculatorSelectOption[]>([]);
  const [featureOptions, setFeatureOptions] = useState<CalculatorSelectOption[]>([]);

  const [selectedOwnership, setSelectedOwnership] =
    useState<CalculatorSelectOption | null>(null);
  const [selectedColor, setSelectedColor] =
    useState<CalculatorSelectOption | null>(null);
  const [selectedFeature, setSelectedFeature] =
    useState<CalculatorSelectOption | null>(null);

  const [loadingAdjustments, setLoadingAdjustments] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const brandRequestRef = useRef(0);
  const modelRequestRef = useRef(0);
  const variantRequestRef = useRef(0);
  const yearRequestRef = useRef(0);

  const resetAdjustments = () => {
    setOwnershipOptions([]);
    setColorOptions([]);
    setFeatureOptions([]);
    setSelectedOwnership(null);
    setSelectedColor(null);
    setSelectedFeature(null);
  };

  const loadBrandOptions = async (
    page = 1,
    search = '',
    append = false,
  ) => {
    const requestId = ++brandRequestRef.current;

    setBrandState((prev) => ({
      ...prev,
      loading: !append,
      loadingMore: append,
    }));

    try {
      const response = await getCalculatorBrands({
        page,
        perPage: SELECT_PAGE_SIZE,
        search: search.trim() || undefined,
      });

      if (requestId !== brandRequestRef.current) {
        return;
      }

      const mappedItems: CalculatorSelectOption[] = response.data.map((brand) => ({
        id: brand.id,
        label: brand.name,
      }));

      setBrandState((prev) => ({
        items: append ? mergeOptions(prev.items, mappedItems) : mappedItems,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        loading: false,
        loadingMore: false,
      }));
      setError(null);
    } catch {
      if (requestId !== brandRequestRef.current) {
        return;
      }

      setBrandState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
      setError('Gagal memuat pilihan merk mobil.');
    }
  };

  const loadModelOptions = async (
    brandId: string,
    page = 1,
    search = '',
    append = false,
  ) => {
    const requestId = ++modelRequestRef.current;

    setModelState((prev) => ({
      ...prev,
      loading: !append,
      loadingMore: append,
    }));

    try {
      const response = await getCalculatorModels({
        brandId,
        page,
        perPage: SELECT_PAGE_SIZE,
        search: search.trim() || undefined,
      });

      if (requestId !== modelRequestRef.current) {
        return;
      }

      const mappedItems: CalculatorSelectOption[] = response.data.map((model) => ({
        id: model.id,
        label: model.modelName,
        subtitle: model.brandName,
      }));

      setModelState((prev) => ({
        items: append ? mergeOptions(prev.items, mappedItems) : mappedItems,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        loading: false,
        loadingMore: false,
      }));
      setError(null);
    } catch {
      if (requestId !== modelRequestRef.current) {
        return;
      }

      setModelState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
      setError('Gagal memuat pilihan model mobil.');
    }
  };

  const loadVariantOptions = async (
    modelId: string,
    page = 1,
    search = '',
    append = false,
  ) => {
    const requestId = ++variantRequestRef.current;

    setVariantState((prev) => ({
      ...prev,
      loading: !append,
      loadingMore: append,
    }));

    try {
      const response = await getCalculatorVariants({
        modelId,
        page,
        perPage: SELECT_PAGE_SIZE,
        search: search.trim() || undefined,
      });

      if (requestId !== variantRequestRef.current) {
        return;
      }

      const mappedItems: CalculatorSelectOption[] = response.data.map((variant) => ({
        id: variant.id,
        label: variant.variantName,
        subtitle:
          variant.transmissionType === 'matic'
            ? 'Transmisi matic'
            : variant.transmissionType === 'manual'
              ? 'Transmisi manual'
              : 'Manual dan matic',
      }));

      setVariantState((prev) => ({
        items: append ? mergeOptions(prev.items, mappedItems) : mappedItems,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        loading: false,
        loadingMore: false,
      }));
      setError(null);
    } catch {
      if (requestId !== variantRequestRef.current) {
        return;
      }

      setVariantState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
      setError('Gagal memuat pilihan varian mobil.');
    }
  };

  const loadYearOptions = async (
    variantId: string,
    page = 1,
    search = '',
    append = false,
  ) => {
    const requestId = ++yearRequestRef.current;

    setYearState((prev) => ({
      ...prev,
      loading: !append,
      loadingMore: append,
    }));

    const trimmedSearch = search.trim();
    const normalizedYear =
      /^\d{4}$/.test(trimmedSearch) && Number(trimmedSearch) >= 2000
        ? Number(trimmedSearch)
        : undefined;

    try {
      const response = await getCalculatorYearPrices({
        variantId,
        page,
        perPage: SELECT_PAGE_SIZE,
        year: normalizedYear,
      });

      if (requestId !== yearRequestRef.current) {
        return;
      }

      const mappedItems: CalculatorSelectOption[] = response.data.map((item) => ({
        id: item.id,
        label: `${item.year}`,
        subtitle: `Harga dasar ${formatRupiahFull(item.basePrice)}`,
        year: item.year,
        basePrice: item.basePrice,
      }));

      setYearState((prev) => ({
        items: append ? mergeOptions(prev.items, mappedItems) : mappedItems,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        loading: false,
        loadingMore: false,
      }));
      setError(null);
    } catch {
      if (requestId !== yearRequestRef.current) {
        return;
      }

      setYearState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
      setError('Gagal memuat pilihan tahun mobil.');
    }
  };

  useEffect(() => {
    loadBrandOptions(1, debouncedBrandSearch);
  }, [debouncedBrandSearch]);

  useEffect(() => {
    setSelectedModel(null);
    setSelectedVariant(null);
    setSelectedYear(null);
    setModelSearch('');
    setVariantSearch('');
    setYearSearch('');
    setModelState(createPagedState());
    setVariantState(createPagedState());
    setYearState(createPagedState());
    resetAdjustments();
    setResult(null);

    if (!selectedBrand) {
      setLoadingAdjustments(false);
    }
  }, [selectedBrand?.id]);

  useEffect(() => {
    if (!selectedBrand) {
      return;
    }

    loadModelOptions(selectedBrand.id, 1, debouncedModelSearch);
  }, [debouncedModelSearch, selectedBrand?.id]);

  useEffect(() => {
    setSelectedVariant(null);
    setSelectedYear(null);
    setVariantSearch('');
    setYearSearch('');
    setVariantState(createPagedState());
    setYearState(createPagedState());
    setResult(null);

    if (!selectedModel) {
      resetAdjustments();
      setLoadingAdjustments(false);
      return;
    }

    setLoadingAdjustments(true);

    getPriceAdjustmentsByModel(selectedModel.id)
      .then((adjustments) => {
        const nextOwnershipOptions = mapAdjustmentOptions(
          adjustments.adjustments.ownership || [],
        );
        const nextColorOptions = mapAdjustmentOptions(
          adjustments.adjustments.color || [],
        );
        const nextFeatureOptions = mapAdjustmentOptions(
          adjustments.adjustments.feature || [],
        );

        setOwnershipOptions(nextOwnershipOptions);
        setColorOptions(nextColorOptions);
        setFeatureOptions(nextFeatureOptions);
        setSelectedOwnership(pickDefaultAdjustment(nextOwnershipOptions));
        setSelectedColor(pickDefaultAdjustment(nextColorOptions));
        setSelectedFeature(pickDefaultAdjustment(nextFeatureOptions));
        setError(null);
      })
      .catch(() => {
        resetAdjustments();
        setError('Konfigurasi penyesuaian harga untuk model ini belum tersedia.');
      })
      .finally(() => {
        setLoadingAdjustments(false);
      });
  }, [selectedModel?.id]);

  useEffect(() => {
    if (!selectedModel) {
      return;
    }

    loadVariantOptions(selectedModel.id, 1, debouncedVariantSearch);
  }, [debouncedVariantSearch, selectedModel?.id]);

  useEffect(() => {
    setSelectedYear(null);
    setYearSearch('');
    setYearState(createPagedState());
    setResult(null);
  }, [selectedVariant?.id]);

  useEffect(() => {
    if (!selectedVariant) {
      return;
    }

    loadYearOptions(selectedVariant.id, 1, debouncedYearSearch);
  }, [debouncedYearSearch, selectedVariant?.id]);

  const canCalculate = Boolean(
    selectedVariant?.id &&
      selectedYear?.year &&
      selectedOwnership?.code &&
      selectedColor?.code &&
      selectedFeature?.code,
  );

  const handleCalculate = async () => {
    if (!canCalculate || !selectedVariant || !selectedYear) {
      return;
    }

    try {
      setCalculating(true);
      setError(null);

      const calculationResult = await calculatePrice({
        variantId: selectedVariant.id,
        year: selectedYear.year!,
        ownershipCode: selectedOwnership?.code || '',
        colorCode: selectedColor?.code || '',
        featureCode: selectedFeature?.code || '',
      });

      setResult(calculationResult);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menghitung estimasi harga.';
      setError(message);
    } finally {
      setCalculating(false);
    }
  };

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
          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="car-sport" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Pilih Mobil</Text>
            </View>

            <View style={styles.selectGroup}>
              <SearchableSelectField
                label="Merk"
                placeholder="Pilih merk mobil"
                modalTitle="Pilih Merk Mobil"
                selectedId={selectedBrand?.id}
                selectedLabel={selectedBrand?.label}
                options={brandState.items}
                loading={brandState.loading}
                loadingMore={brandState.loadingMore}
                searchEnabled
                searchValue={brandSearch}
                onSearchChange={setBrandSearch}
                onLoadMore={() =>
                  loadBrandOptions(
                    brandState.page + 1,
                    debouncedBrandSearch,
                    true,
                  )
                }
                hasNextPage={brandState.page < brandState.totalPages}
                emptyText="Merk mobil belum tersedia."
                onSelect={(option) => {
                  setSelectedBrand(option as CalculatorSelectOption);
                }}
              />

              <SearchableSelectField
                label="Model"
                placeholder="Pilih model mobil"
                modalTitle="Pilih Model Mobil"
                selectedId={selectedModel?.id}
                selectedLabel={selectedModel?.label}
                options={modelState.items}
                disabled={!selectedBrand}
                loading={modelState.loading}
                loadingMore={modelState.loadingMore}
                searchEnabled
                searchValue={modelSearch}
                onSearchChange={setModelSearch}
                onLoadMore={() => {
                  if (!selectedBrand) {
                    return;
                  }

                  loadModelOptions(
                    selectedBrand.id,
                    modelState.page + 1,
                    debouncedModelSearch,
                    true,
                  );
                }}
                hasNextPage={modelState.page < modelState.totalPages}
                emptyText="Model untuk merk ini belum tersedia."
                onSelect={(option) => {
                  setSelectedModel(option as CalculatorSelectOption);
                }}
              />

              <SearchableSelectField
                label="Varian"
                placeholder="Pilih varian mobil"
                modalTitle="Pilih Varian Mobil"
                selectedId={selectedVariant?.id}
                selectedLabel={selectedVariant?.label}
                options={variantState.items}
                disabled={!selectedModel}
                loading={variantState.loading}
                loadingMore={variantState.loadingMore}
                searchEnabled
                searchValue={variantSearch}
                onSearchChange={setVariantSearch}
                onLoadMore={() => {
                  if (!selectedModel) {
                    return;
                  }

                  loadVariantOptions(
                    selectedModel.id,
                    variantState.page + 1,
                    debouncedVariantSearch,
                    true,
                  );
                }}
                hasNextPage={variantState.page < variantState.totalPages}
                emptyText="Varian untuk model ini belum tersedia."
                onSelect={(option) => {
                  setSelectedVariant(option as CalculatorSelectOption);
                }}
              />

              <SearchableSelectField
                label="Tahun"
                placeholder="Pilih tahun mobil"
                modalTitle="Pilih Tahun Mobil"
                selectedId={selectedYear?.id}
                selectedLabel={selectedYear?.label}
                options={yearState.items}
                disabled={!selectedVariant}
                loading={yearState.loading}
                loadingMore={yearState.loadingMore}
                searchEnabled
                searchPlaceholder="Cari tahun, misalnya 2024"
                searchValue={yearSearch}
                onSearchChange={setYearSearch}
                onLoadMore={() => {
                  if (!selectedVariant) {
                    return;
                  }

                  loadYearOptions(
                    selectedVariant.id,
                    yearState.page + 1,
                    debouncedYearSearch,
                    true,
                  );
                }}
                hasNextPage={yearState.page < yearState.totalPages}
                emptyText="Tahun untuk varian ini belum tersedia."
                onSelect={(option) => {
                  setSelectedYear(option as CalculatorSelectOption);
                }}
              />
            </View>
          </View>

          <View style={[styles.card, Shadows.medium]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="options" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Kondisi</Text>
            </View>

            {loadingAdjustments ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View style={styles.selectGroup}>
                <SearchableSelectField
                  label="Kepemilikan"
                  placeholder="Pilih status kepemilikan"
                  modalTitle="Pilih Status Kepemilikan"
                  selectedId={selectedOwnership?.id}
                  selectedLabel={selectedOwnership?.label}
                  options={ownershipOptions}
                  disabled={!selectedModel || ownershipOptions.length === 0}
                  emptyText="Belum ada opsi kepemilikan."
                  onSelect={(option) => {
                    setSelectedOwnership(option as CalculatorSelectOption);
                  }}
                />

                <SearchableSelectField
                  label="Warna"
                  placeholder="Pilih warna mobil"
                  modalTitle="Pilih Warna Mobil"
                  selectedId={selectedColor?.id}
                  selectedLabel={selectedColor?.label}
                  options={colorOptions}
                  disabled={!selectedModel || colorOptions.length === 0}
                  emptyText="Belum ada opsi warna."
                  onSelect={(option) => {
                    setSelectedColor(option as CalculatorSelectOption);
                  }}
                />

                <SearchableSelectField
                  label="Fitur Tambahan"
                  placeholder="Pilih fitur tambahan"
                  modalTitle="Pilih Fitur Tambahan"
                  selectedId={selectedFeature?.id}
                  selectedLabel={selectedFeature?.label}
                  options={featureOptions}
                  disabled={!selectedModel || featureOptions.length === 0}
                  emptyText="Belum ada opsi fitur tambahan."
                  onSelect={(option) => {
                    setSelectedFeature(option as CalculatorSelectOption);
                  }}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCalculate}
            disabled={!canCalculate || calculating}
          >
            <LinearGradient
              colors={
                canCalculate
                  ? [Colors.gradientStart, Colors.gradientEnd]
                  : ['#94A3B8', '#94A3B8']
              }
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

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {result ? (
            <View style={[styles.resultCard, Shadows.large]}>
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultHeader}
              >
                <Text style={styles.resultHeaderTitle}>Estimasi Harga Pasar</Text>
                <Text style={styles.finalPrice}>
                  {formatRupiahFull(result.finalPrice)}
                </Text>
                <Text style={styles.priceRange}>
                  {formatRupiahFull(result.priceRange.min)} -{' '}
                  {formatRupiahFull(result.priceRange.max)}
                </Text>
              </LinearGradient>

              <View style={styles.resultBody}>
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Detail Mobil</Text>
                  <Text style={styles.resultCarName}>
                    {result.car.brandName} {result.car.modelName}
                  </Text>
                  <Text style={styles.resultCarVariant}>
                    {result.car.variantName} - {result.car.year}
                  </Text>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Rincian Harga</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Harga Dasar</Text>
                    <Text style={styles.breakdownValue}>
                      {formatRupiahFull(result.priceBreakdown.basePrice)}
                    </Text>
                  </View>
                  {result.priceBreakdown.adjustments.map((adjustment) => (
                    <View
                      key={adjustment.category}
                      style={styles.breakdownRow}
                    >
                      <Text style={styles.breakdownLabel}>{adjustment.name}</Text>
                      <Text
                        style={[
                          styles.breakdownValue,
                          {
                            color:
                              adjustment.amount >= 0
                                ? Colors.success
                                : Colors.error,
                          },
                        ]}
                      >
                        {adjustment.amount >= 0 ? '+' : ''}
                        {formatRupiahFull(adjustment.amount)}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                    <Text style={styles.breakdownTotalLabel}>
                      Total Penyesuaian
                    </Text>
                    <Text style={styles.breakdownTotalValue}>
                      {formatRupiahFull(result.priceBreakdown.totalAdjustments)}
                    </Text>
                  </View>
                </View>

                {result.priceRange.note ? (
                  <View style={styles.disclaimer}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color={Colors.textTertiary}
                    />
                    <Text style={styles.disclaimerText}>
                      {result.priceRange.note}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
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
  selectGroup: {
    gap: 14,
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
    gap: 16,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
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
