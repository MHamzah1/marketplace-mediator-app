import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthActionButton from "@/components/auth/AuthActionButton";
import SearchableSelectField, {
  SearchableSelectOption,
} from "@/components/ui/SearchableSelectField";
import { useTheme } from "@/context/ThemeContext";
import { Shadows } from "@/constants/Colors";
import type { Brand } from "@/types";

export type SortBy =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "mileage";
export type Condition = "all" | "baru" | "bekas";
export type Transmission = "all" | "manual" | "matic" | "cvt";
export type FuelType = "all" | "bensin" | "diesel" | "hybrid" | "listrik";
export type Periode =
  | "all"
  | "Today"
  | "ThisWeek"
  | "LastWeek"
  | "ThisMonth"
  | "LastMonth"
  | "ThisYear"
  | "LastYear"
  | "Last3Months"
  | "Last6Months";

export interface MarketplaceFilters {
  brandId: string | null;
  condition: Condition;
  minPrice: string;
  maxPrice: string;
  yearMin: string;
  yearMax: string;
  transmission: Transmission;
  fuelType: FuelType;
  locationCity: string;
  periode: Periode;
  sortBy: SortBy;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: MarketplaceFilters) => void;
  brands: Brand[];
  initial: MarketplaceFilters;
}

const SORT_OPTIONS: SearchableSelectOption[] = [
  { id: "newest", label: "Terbaru" },
  { id: "oldest", label: "Terlama" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "mileage", label: "Kilometer Terendah" },
];

const CONDITION_OPTIONS: SearchableSelectOption[] = [
  { id: "all", label: "Semua Kondisi" },
  { id: "baru", label: "Baru" },
  { id: "bekas", label: "Bekas" },
];

const TRANSMISSION_OPTIONS: SearchableSelectOption[] = [
  { id: "all", label: "Semua Transmisi" },
  { id: "manual", label: "Manual" },
  { id: "matic", label: "Matic" },
  { id: "cvt", label: "CVT" },
];

const FUEL_OPTIONS: SearchableSelectOption[] = [
  { id: "all", label: "Semua Bahan Bakar" },
  { id: "bensin", label: "Bensin" },
  { id: "diesel", label: "Diesel" },
  { id: "hybrid", label: "Hybrid" },
  { id: "listrik", label: "Listrik" },
];

const PERIODE_OPTIONS: SearchableSelectOption[] = [
  { id: "all", label: "Semua Periode" },
  { id: "Today", label: "Hari Ini" },
  { id: "ThisWeek", label: "Minggu Ini" },
  { id: "LastWeek", label: "Minggu Lalu" },
  { id: "ThisMonth", label: "Bulan Ini" },
  { id: "LastMonth", label: "Bulan Lalu" },
  { id: "Last3Months", label: "3 Bulan Terakhir" },
  { id: "Last6Months", label: "6 Bulan Terakhir" },
  { id: "ThisYear", label: "Tahun Ini" },
  { id: "LastYear", label: "Tahun Lalu" },
];

export const DEFAULT_FILTERS: MarketplaceFilters = {
  brandId: null,
  condition: "all",
  minPrice: "",
  maxPrice: "",
  yearMin: "",
  yearMax: "",
  transmission: "all",
  fuelType: "all",
  locationCity: "",
  periode: "all",
  sortBy: "newest",
};

function labelOf(
  options: SearchableSelectOption[],
  id: string | null | undefined,
): string | null {
  if (!id) return null;
  return options.find((o) => o.id === id)?.label ?? null;
}

function fmtRupiah(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function stripRupiah(formatted: string): string {
  return formatted.replace(/\./g, "");
}

export default function FilterSheet({
  visible,
  onClose,
  onApply,
  brands,
  initial,
}: FilterSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState<MarketplaceFilters>(initial);

  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const brandOptions: SearchableSelectOption[] = [
    { id: "__all__", label: "Semua Merek" },
    ...brands.map((b) => ({ id: b.id, label: b.name })),
  ];

  const reset = () => setDraft(DEFAULT_FILTERS);
  const apply = () => {
    onApply(draft);
    onClose();
  };

  const inputContainerStyle = {
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  } as const;

  const inputTextStyle = [styles.textInput, { color: colors.text }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={styles.overlayTap}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            Shadows.large,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 20,
              borderColor: isDark ? colors.border : "transparent",
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              Sort &amp; Filter
            </Text>
            <TouchableOpacity onPress={reset}>
              <Text style={[styles.resetText, { color: colors.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 560 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {/* Sort */}
              <SearchableSelectField
                label="Urutkan"
                placeholder="Pilih urutan"
                modalTitle="Urutkan"
                selectedId={draft.sortBy}
                selectedLabel={labelOf(SORT_OPTIONS, draft.sortBy)}
                options={SORT_OPTIONS}
                onSelect={(opt) =>
                  setDraft((d) => ({ ...d, sortBy: opt.id as SortBy }))
                }
              />

              {/* Kondisi */}
              <SearchableSelectField
                label="Kondisi"
                placeholder="Pilih kondisi"
                modalTitle="Kondisi Kendaraan"
                selectedId={draft.condition}
                selectedLabel={labelOf(CONDITION_OPTIONS, draft.condition)}
                options={CONDITION_OPTIONS}
                onSelect={(opt) =>
                  setDraft((d) => ({ ...d, condition: opt.id as Condition }))
                }
              />

              {/* Merek */}
              <SearchableSelectField
                label="Merek"
                placeholder="Pilih merek"
                modalTitle="Pilih Merek"
                selectedId={draft.brandId ?? "__all__"}
                selectedLabel={
                  draft.brandId
                    ? labelOf(brandOptions, draft.brandId)
                    : "Semua Merek"
                }
                options={brandOptions}
                onSelect={(opt) =>
                  setDraft((d) => ({
                    ...d,
                    brandId: opt.id === "__all__" ? null : opt.id,
                  }))
                }
                searchEnabled
                searchPlaceholder="Cari merek..."
              />

              {/* Transmisi */}
              <SearchableSelectField
                label="Transmisi"
                placeholder="Pilih transmisi"
                modalTitle="Transmisi"
                selectedId={draft.transmission}
                selectedLabel={labelOf(TRANSMISSION_OPTIONS, draft.transmission)}
                options={TRANSMISSION_OPTIONS}
                onSelect={(opt) =>
                  setDraft((d) => ({
                    ...d,
                    transmission: opt.id as Transmission,
                  }))
                }
              />

              {/* Bahan Bakar */}
              <SearchableSelectField
                label="Bahan Bakar"
                placeholder="Pilih bahan bakar"
                modalTitle="Bahan Bakar"
                selectedId={draft.fuelType}
                selectedLabel={labelOf(FUEL_OPTIONS, draft.fuelType)}
                options={FUEL_OPTIONS}
                onSelect={(opt) =>
                  setDraft((d) => ({ ...d, fuelType: opt.id as FuelType }))
                }
              />

              {/* Periode */}
              <SearchableSelectField
                label="Periode Listing"
                placeholder="Pilih periode"
                modalTitle="Periode"
                selectedId={draft.periode}
                selectedLabel={labelOf(PERIODE_OPTIONS, draft.periode)}
                options={PERIODE_OPTIONS}
                onSelect={(opt) =>
                  setDraft((d) => ({ ...d, periode: opt.id as Periode }))
                }
              />

              {/* Harga */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Rentang Harga (Rp)
                </Text>
                <View style={styles.twoCol}>
                  <View style={[styles.inputWrap, { flex: 1 }, inputContainerStyle]}>
                    <Ionicons name="arrow-down" size={14} color={colors.textTertiary} />
                    <TextInput
                      value={fmtRupiah(draft.minPrice)}
                      onChangeText={(v) =>
                        setDraft((d) => ({ ...d, minPrice: stripRupiah(v) }))
                      }
                      placeholder="Min"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={inputTextStyle}
                    />
                  </View>
                  <View style={[styles.inputWrap, { flex: 1 }, inputContainerStyle]}>
                    <Ionicons name="arrow-up" size={14} color={colors.textTertiary} />
                    <TextInput
                      value={fmtRupiah(draft.maxPrice)}
                      onChangeText={(v) =>
                        setDraft((d) => ({ ...d, maxPrice: stripRupiah(v) }))
                      }
                      placeholder="Max"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={inputTextStyle}
                    />
                  </View>
                </View>
              </View>

              {/* Tahun */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Tahun
                </Text>
                <View style={styles.twoCol}>
                  <View style={[styles.inputWrap, { flex: 1 }, inputContainerStyle]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <TextInput
                      value={draft.yearMin}
                      onChangeText={(v) =>
                        setDraft((d) => ({
                          ...d,
                          yearMin: v.replace(/[^0-9]/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="Dari"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={inputTextStyle}
                    />
                  </View>
                  <View style={[styles.inputWrap, { flex: 1 }, inputContainerStyle]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <TextInput
                      value={draft.yearMax}
                      onChangeText={(v) =>
                        setDraft((d) => ({
                          ...d,
                          yearMax: v.replace(/[^0-9]/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="Sampai"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={inputTextStyle}
                    />
                  </View>
                </View>
              </View>

              {/* Kota */}
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Kota
                </Text>
                <View style={[styles.inputWrap, inputContainerStyle]}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                  <TextInput
                    value={draft.locationCity}
                    onChangeText={(v) =>
                      setDraft((d) => ({ ...d, locationCity: v }))
                    }
                    placeholder="Mis. Jakarta, Bandung"
                    placeholderTextColor={colors.textTertiary}
                    style={[inputTextStyle, { flex: 1 }]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.backgroundSecondary },
              ]}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Batal
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <AuthActionButton label="Terapkan" onPress={apply} variant="dark" />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayTap: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 6,
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "800",
  },
  form: {
    gap: 14,
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    borderWidth: 0,
    padding: 0,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    height: 50,
    minWidth: 96,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
