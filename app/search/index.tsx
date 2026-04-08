import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import SearchBar from '@/components/marketplace/SearchBar';
import ListingCard from '@/components/marketplace/ListingCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Listing, Pagination, Brand } from '@/types';
import { fetchListings } from '@/lib/api/marketplaceService';
import { fetchBrands } from '@/lib/api/brandService';
import { resolveImageUrl } from '@/lib/utils';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);

  // Search results
  const [results, setResults] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);

  // Filter state
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim() && !selectedBrandId) {
      setResults([]);
      setSearched(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      doSearch(1, false);
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, selectedBrandId, selectedTransmission, sortBy]);

  const doSearch = useCallback(async (pageNum: number, append: boolean) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params: Record<string, unknown> = {
        page: pageNum,
        perPage: 15,
      };
      if (query.trim()) params.search = query.trim();
      if (selectedBrandId) params.brandId = selectedBrandId;
      if (selectedTransmission) params.transmission = selectedTransmission;
      if (sortBy) params.sortBy = sortBy;

      const res = await fetchListings(params as never);
      const items = res.data ?? [];

      if (append) {
        setResults((prev) => [...prev, ...items]);
      } else {
        setResults(items);
      }
      setPagination(res.pagination ?? null);
      setSearched(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, selectedBrandId, selectedTransmission, sortBy]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (pagination && page < pagination.totalPages) {
      const next = page + 1;
      setPage(next);
      doSearch(next, true);
    }
  }, [loadingMore, loading, pagination, page, doSearch]);

  const handleBrandPress = (brandId: string) => {
    setSelectedBrandId((prev) => (prev === brandId ? null : brandId));
  };

  const hasQuery = query.trim().length > 0 || !!selectedBrandId;

  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga Terendah' },
    { value: 'price_desc', label: 'Harga Tertinggi' },
    { value: 'year_desc', label: 'Tahun Terbaru' },
  ];

  const renderFilters = () => (
    <View>
      {/* Transmission filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {transmissions.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterChip, selectedTransmission === t && styles.filterChipActive]}
            onPress={() => setSelectedTransmission((prev) => (prev === t ? null : t))}
          >
            <Text style={[styles.filterChipText, selectedTransmission === t && styles.filterChipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.filterDivider} />
        {sortOptions.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.filterChip, sortBy === s.value && styles.filterChipActive]}
            onPress={() => setSortBy(s.value)}
          >
            <Text style={[styles.filterChipText, sortBy === s.value && styles.filterChipTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Popular Brands from API */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Merk Populer</Text>
        <View style={styles.brandsGrid}>
          {brands.slice(0, 8).map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={[
                styles.brandChip,
                Shadows.small,
                selectedBrandId === brand.id && styles.brandChipActive,
              ]}
              onPress={() => handleBrandPress(brand.id)}
            >
              {brand.logo ? (
                <View style={styles.brandIconBg}>
                  <Ionicons name="car" size={20} color={Colors.primary} />
                </View>
              ) : (
                <View style={styles.brandIconBg}>
                  <Text style={styles.brandInitial}>{brand.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={[styles.brandName, selectedBrandId === brand.id && styles.brandNameActive]}>
                {brand.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            editable
            autoFocus
            placeholder="Cari merk, model, atau kata kunci..."
          />
        </View>
      </View>

      {!hasQuery ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard item={item} variant="horizontal" />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View>
              {renderFilters()}
              {searched && !loading && (
                <Text style={styles.resultCount}>
                  {pagination ? `${pagination.totalRecords} hasil ditemukan` : ''}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Mencari...</Text>
              </View>
            ) : searched ? (
              <EmptyState
                icon="search-outline"
                title="Tidak Ditemukan"
                subtitle="Coba gunakan kata kunci atau filter yang berbeda"
              />
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
        />
      )}
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
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  resultCount: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  brandChipActive: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  brandNameActive: {
    color: Colors.primary,
  },
});
