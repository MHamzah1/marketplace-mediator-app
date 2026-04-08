import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientHeader from '@/components/ui/GradientHeader';
import SearchBar from '@/components/marketplace/SearchBar';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import FeaturedCarousel from '@/components/marketplace/FeaturedCarousel';
import ListingCard from '@/components/marketplace/ListingCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Colors from '@/constants/Colors';
import type { Listing, Pagination } from '@/types';
import { fetchListings, fetchFeaturedListings } from '@/lib/api/marketplaceService';

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Featured
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      const res = await fetchFeaturedListings(6);
      setFeatured(res.data ?? []);
    } catch {
      // silent — featured is optional
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const loadListings = useCallback(async (pageNum: number, category: string, append = false) => {
    try {
      if (!append) setListingsLoading(true);
      else setLoadingMore(true);
      setError(null);

      const params: Record<string, unknown> = { page: pageNum, perPage: 10 };
      if (category !== 'all') {
        params.condition = category;
      }

      const res = await fetchListings(params as never);
      const newItems = res.data ?? [];

      if (append) {
        setListings((prev) => [...prev, ...newItems]);
      } else {
        setListings(newItems);
      }
      setPagination(res.pagination ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat listing';
      setError(msg);
    } finally {
      setListingsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeatured();
    loadListings(1, selectedCategory);
  }, []);

  // Category change
  useEffect(() => {
    setPage(1);
    loadListings(1, selectedCategory);
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([loadFeatured(), loadListings(1, selectedCategory)]);
    setRefreshing(false);
  }, [selectedCategory, loadFeatured, loadListings]);

  const onEndReached = useCallback(() => {
    if (loadingMore || listingsLoading) return;
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadListings(nextPage, selectedCategory, true);
    }
  }, [loadingMore, listingsLoading, pagination, page, selectedCategory, loadListings]);

  const renderHeader = () => (
    <View>
      <GradientHeader title="Mediator" subtitle="Temukan mobil impian Anda" height={160}>
        <View style={{ marginTop: 16 }}>
          <SearchBar />
        </View>
      </GradientHeader>

      <View style={styles.sectionGap}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {featuredLoading ? (
        <View style={styles.featuredLoading}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <FeaturedCarousel items={featured} />
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Terbaru</Text>
        <Text style={styles.listSubtitle}>
          {pagination ? `${pagination.totalRecords} mobil tersedia` : 'Memuat...'}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.footerText}>Memuat lebih banyak...</Text>
        </View>
      );
    }
    return null;
  };

  if (listingsLoading && !refreshing && listings.length === 0) {
    return (
      <View style={styles.screen}>
        <GradientHeader title="Mediator" subtitle="Temukan mobil impian Anda" height={160}>
          <View style={{ marginTop: 16 }}>
            <SearchBar />
          </View>
        </GradientHeader>
        <LoadingSpinner message="Memuat marketplace..." />
      </View>
    );
  }

  if (error && listings.length === 0) {
    return (
      <View style={styles.screen}>
        <GradientHeader title="Mediator" subtitle="Temukan mobil impian Anda" height={160}>
          <View style={{ marginTop: 16 }}>
            <SearchBar />
          </View>
        </GradientHeader>
        <EmptyState
          icon="cloud-offline-outline"
          title="Gagal Memuat Data"
          subtitle={error}
          actionLabel="Coba Lagi"
          onAction={() => {
            loadFeatured();
            loadListings(1, selectedCategory);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !listingsLoading ? (
            <EmptyState
              icon="car-outline"
              title="Belum Ada Listing"
              subtitle="Belum ada mobil yang tersedia saat ini"
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sectionGap: {
    marginTop: 16,
  },
  featuredLoading: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
