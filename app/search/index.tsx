import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ListingCard from '@/components/marketplace/ListingCard';
import SearchBar from '@/components/marketplace/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import Colors, { Shadows } from '@/constants/Colors';
import { fetchBrands } from '@/lib/api/brandService';
import { fetchListings } from '@/lib/api/marketplaceService';
import type { Brand, Listing, Pagination } from '@/types';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    search?: string;
    brandId?: string;
  }>();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(params.search || '');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [results, setResults] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(params.brandId || null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const loadResults = useCallback(async (pageNum: number, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const res = await fetchListings({
        page: pageNum,
        perPage: 12,
        search: query.trim() || undefined,
        brandId: selectedBrandId || undefined,
        condition: selectedCondition || undefined,
        transmission: selectedTransmission || undefined,
        sortBy,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      const items = res.data ?? [];
      setResults((prev) => (append ? [...prev, ...items] : items));
      setPagination(res.pagination ?? null);
    } catch {
      if (!append) {
        setResults([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [maxPrice, minPrice, query, selectedBrandId, selectedCondition, selectedTransmission, sortBy]);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      loadResults(1);
    }, 260);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadResults]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadResults(1);
    setRefreshing(false);
  }, [loadResults]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadResults(nextPage, true);
    }
  }, [loadResults, loading, loadingMore, page, pagination]);

  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga Terendah' },
    { value: 'price_desc', label: 'Harga Tertinggi' },
    { value: 'year_desc', label: 'Tahun Terbaru' },
  ];

  const renderFilterModal = () => (
    <Modal transparent visible={showFilters} animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowFilters(false)} />

        <View style={[styles.modalCard, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Sort &amp; Filter</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.groupTitle}>Car Brands</Text>
            <View style={styles.modalChipWrap}>
              <TouchableOpacity
                style={[styles.modalChip, !selectedBrandId && styles.modalChipActive]}
                onPress={() => setSelectedBrandId(null)}
              >
                <Text style={[styles.modalChipText, !selectedBrandId && styles.modalChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              {brands.slice(0, 8).map((brand) => {
                const active = selectedBrandId === brand.id;
                return (
                  <TouchableOpacity
                    key={brand.id}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSelectedBrandId(brand.id)}
                  >
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.groupTitle}>Car Condition</Text>
            <View style={styles.modalChipWrap}>
              {[
                { label: 'All', value: null },
                { label: 'New', value: 'baru' },
                { label: 'Used', value: 'bekas' },
              ].map((option) => {
                const active = selectedCondition === option.value;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSelectedCondition(option.value)}
                  >
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.groupTitle}>Transmission</Text>
            <View style={styles.modalChipWrap}>
              <TouchableOpacity
                style={[styles.modalChip, !selectedTransmission && styles.modalChipActive]}
                onPress={() => setSelectedTransmission(null)}
              >
                <Text style={[styles.modalChipText, !selectedTransmission && styles.modalChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              {transmissions.map((option) => {
                const active = selectedTransmission === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSelectedTransmission(option)}
                  >
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.groupTitle}>Price Range</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceInput}>
                <Text style={styles.pricePrefix}>Rp</Text>
                <TextInput
                  style={styles.priceInputField}
                  value={minPrice}
                  onChangeText={(value) => setMinPrice(value.replace(/[^0-9]/g, ''))}
                  placeholder="Min"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.priceInput}>
                <Text style={styles.pricePrefix}>Rp</Text>
                <TextInput
                  style={styles.priceInputField}
                  value={maxPrice}
                  onChangeText={(value) => setMaxPrice(value.replace(/[^0-9]/g, ''))}
                  placeholder="Max"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.groupTitle}>Sort By</Text>
            <View style={styles.modalChipWrap}>
              {sortOptions.map((option) => {
                const active = sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedBrandId(null);
                setSelectedCondition(null);
                setSelectedTransmission(null);
                setSortBy('newest');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyButton, Shadows.blue]}
              onPress={() => {
                setShowFilters(false);
                setPage(1);
                loadResults(1);
              }}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />

      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SearchBar
            editable
            value={query}
            onChangeText={setQuery}
            placeholder="Cari mobil favorit Anda..."
            showFilterButton
            onFilterPress={() => setShowFilters(true)}
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListHeaderComponent={
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              {query.trim() ? `Results for "${query}"` : 'Semua listing'}
            </Text>
            <Text style={styles.resultCount}>
              {pagination ? `${pagination.totalRecords.toLocaleString('id-ID')} founds` : 'Memuat...'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.text} />
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="Tidak ada hasil"
              subtitle="Coba ubah kata kunci atau filter pencarian Anda."
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.text} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 34 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.25}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.text]}
            tintColor={Colors.text}
          />
        }
      />

      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.6,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  loadingBox: {
    paddingTop: 120,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlayLight,
  },
  modalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },
  modalHandle: {
    width: 58,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  modalContent: {
    gap: 18,
    paddingBottom: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  modalChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modalChipTextActive: {
    color: Colors.white,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.inputFill,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  pricePrefix: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  priceInputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  applyButton: {
    flex: 1,
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});
