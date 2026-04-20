import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { useTheme } from '@/context/ThemeContext';
import { Shadows } from '@/constants/Colors';
import type { Brand } from '@/types';

export interface MarketplaceFilters {
  brandId: string | null;
  condition: 'all' | 'baru' | 'bekas';
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: MarketplaceFilters) => void;
  brands: Brand[];
  initial: MarketplaceFilters;
}

const SORT_OPTIONS: { id: MarketplaceFilters['sortBy']; label: string }[] = [
  { id: 'newest', label: 'Terbaru' },
  { id: 'popular', label: 'Terpopuler' },
  { id: 'price-asc', label: 'Harga Terendah' },
  { id: 'price-desc', label: 'Harga Tertinggi' },
];

const CONDITION_OPTIONS: { id: MarketplaceFilters['condition']; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'baru', label: 'Baru' },
  { id: 'bekas', label: 'Bekas' },
];

const DEFAULT_FILTERS: MarketplaceFilters = {
  brandId: null,
  condition: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'newest',
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity style={styles.overlayTap} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            Shadows.large,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 20,
              borderColor: isDark ? colors.border : 'transparent',
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>Sort & Filter</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sort By</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((option) => {
                const active = draft.sortBy === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.85}
                    onPress={() => setDraft((d) => ({ ...d, sortBy: option.id }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.text : colors.backgroundSecondary,
                        borderColor: active ? colors.text : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.textInverse : colors.textSecondary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Condition</Text>
            <View style={styles.chipRow}>
              {CONDITION_OPTIONS.map((option) => {
                const active = draft.condition === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.85}
                    onPress={() => setDraft((d) => ({ ...d, condition: option.id }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.text : colors.backgroundSecondary,
                        borderColor: active ? colors.text : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.textInverse : colors.textSecondary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Brand</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDraft((d) => ({ ...d, brandId: null }))}
                style={[
                  styles.chip,
                  {
                    backgroundColor: !draft.brandId ? colors.text : colors.backgroundSecondary,
                    borderColor: !draft.brandId ? colors.text : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: !draft.brandId ? colors.textInverse : colors.textSecondary },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {brands.map((brand) => {
                const active = draft.brandId === brand.id;
                return (
                  <TouchableOpacity
                    key={brand.id}
                    activeOpacity={0.85}
                    onPress={() => setDraft((d) => ({ ...d, brandId: brand.id }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.text : colors.backgroundSecondary,
                        borderColor: active ? colors.text : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? colors.textInverse : colors.textSecondary },
                      ]}
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Price Range (Rp)</Text>
            <View style={styles.priceRow}>
              <View
                style={[
                  styles.priceInputWrap,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}
              >
                <Ionicons name="arrow-down" size={14} color={colors.textTertiary} />
                <TextInput
                  value={draft.minPrice}
                  onChangeText={(v) =>
                    setDraft((d) => ({ ...d, minPrice: v.replace(/[^0-9]/g, '') }))
                  }
                  placeholder="Min"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.priceInput, { color: colors.text }]}
                />
              </View>
              <View
                style={[
                  styles.priceInputWrap,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}
              >
                <Ionicons name="arrow-up" size={14} color={colors.textTertiary} />
                <TextInput
                  value={draft.maxPrice}
                  onChangeText={(v) =>
                    setDraft((d) => ({ ...d, maxPrice: v.replace(/[^0-9]/g, '') }))
                  }
                  placeholder="Max"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.priceInput, { color: colors.text }]}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <AuthActionButton label="Apply" onPress={apply} variant="dark" />
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
    justifyContent: 'flex-end',
  },
  overlayTap: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 8,
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelButton: {
    height: 58,
    minWidth: 110,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
