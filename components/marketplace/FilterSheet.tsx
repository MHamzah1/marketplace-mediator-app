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

const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: "newest", label: "Terbaru" },
  { id: "oldest", label: "Terlama" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "mileage", label: "Kilometer" },
];

const CONDITION_OPTIONS: { id: Condition; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "baru", label: "Baru" },
  { id: "bekas", label: "Bekas" },
];

const TRANSMISSION_OPTIONS: { id: Transmission; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "manual", label: "Manual" },
  { id: "matic", label: "Matic" },
  { id: "cvt", label: "CVT" },
];

const FUEL_OPTIONS: { id: FuelType; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "bensin", label: "Bensin" },
  { id: "diesel", label: "Diesel" },
  { id: "hybrid", label: "Hybrid" },
  { id: "listrik", label: "Listrik" },
];

const PERIODE_OPTIONS: { id: Periode; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "Today", label: "Hari Ini" },
  { id: "ThisWeek", label: "Minggu Ini" },
  { id: "LastWeek", label: "Minggu Lalu" },
  { id: "ThisMonth", label: "Bulan Ini" },
  { id: "LastMonth", label: "Bulan Lalu" },
  { id: "Last3Months", label: "3 Bulan" },
  { id: "Last6Months", label: "6 Bulan" },
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

  const reset = () => setDraft(DEFAULT_FILTERS);
  const apply = () => {
    onApply(draft);
    onClose();
  };

  const renderChipRow = <T extends string>(
    options: { id: T; label: string }[],
    value: T,
    onPick: (next: T) => void,
  ) => (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.85}
            onPress={() => onPick(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? colors.primary
                  : colors.backgroundSecondary,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.white : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
              Sort & Filter
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
          >
            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Urut
            </Text>
            {renderChipRow(SORT_OPTIONS, draft.sortBy, (v) =>
              setDraft((d) => ({ ...d, sortBy: v })),
            )}

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Kondisi
            </Text>
            {renderChipRow(CONDITION_OPTIONS, draft.condition, (v) =>
              setDraft((d) => ({ ...d, condition: v })),
            )}

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Transmisi
            </Text>
            {renderChipRow(TRANSMISSION_OPTIONS, draft.transmission, (v) =>
              setDraft((d) => ({ ...d, transmission: v })),
            )}

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Bahan Bakar
            </Text>
            {renderChipRow(FUEL_OPTIONS, draft.fuelType, (v) =>
              setDraft((d) => ({ ...d, fuelType: v })),
            )}

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Periode
            </Text>
            {renderChipRow(PERIODE_OPTIONS, draft.periode, (v) =>
              setDraft((d) => ({ ...d, periode: v })),
            )}

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Merek
            </Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDraft((d) => ({ ...d, brandId: null }))}
                style={[
                  styles.chip,
                  {
                    backgroundColor: !draft.brandId
                      ? colors.primary
                      : colors.backgroundSecondary,
                    borderColor: !draft.brandId
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: !draft.brandId
                        ? colors.white
                        : colors.textSecondary,
                    },
                  ]}
                >
                  Semua
                </Text>
              </TouchableOpacity>
              {brands.map((brand) => {
                const active = draft.brandId === brand.id;
                return (
                  <TouchableOpacity
                    key={brand.id}
                    activeOpacity={0.85}
                    onPress={() =>
                      setDraft((d) => ({ ...d, brandId: brand.id }))
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.backgroundSecondary,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.white : colors.textSecondary },
                      ]}
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Harga (Rp)
            </Text>
            <View style={styles.twoColRow}>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-down"
                  size={14}
                  color={colors.textTertiary}
                />
                <TextInput
                  value={draft.minPrice}
                  onChangeText={(v) =>
                    setDraft((d) => ({
                      ...d,
                      minPrice: v.replace(/[^0-9]/g, ""),
                    }))
                  }
                  placeholder="Min"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color={colors.textTertiary}
                />
                <TextInput
                  value={draft.maxPrice}
                  onChangeText={(v) =>
                    setDraft((d) => ({
                      ...d,
                      maxPrice: v.replace(/[^0-9]/g, ""),
                    }))
                  }
                  placeholder="Max"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Tahun
            </Text>
            <View style={styles.twoColRow}>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.textTertiary}
                />
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
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.textTertiary}
                />
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
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Kota
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.textTertiary}
              />
              <TextInput
                value={draft.locationCity}
                onChangeText={(v) =>
                  setDraft((d) => ({ ...d, locationCity: v }))
                }
                placeholder="Mis. Jakarta, Bandung"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { color: colors.text }]}
              />
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
              <AuthActionButton
                label="Terapkan"
                onPress={apply}
                variant="dark"
              />
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
  sectionLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
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
