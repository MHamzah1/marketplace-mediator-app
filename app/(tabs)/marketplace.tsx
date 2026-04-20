import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterSheet, {
  type MarketplaceFilters,
} from '@/components/marketplace/FilterSheet';
import ListingCard from '@/components/marketplace/ListingCard';
import SearchBar from '@/components/marketplace/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { fetchBrands } from '@/lib/api/brandService';
import {
  fetchFeaturedListings,
  fetchListings,
} from '@/lib/api/marketplaceService';
import { resolveImageUrl, getListingTitle, getListingImage } from '@/lib/utils';
import type { Brand, Listing, Pagination } from '@/types';

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, isLoggedIn } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    brandId: null,
    condition: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeBanner, setActiveBanner] = useState(0);
  const filterReadyRef = useRef(false);

  const selectedBrandId = filters.brandId;
  const setSelectedBrandId = useCallback(
    (value: string | null | ((prev: string | null) => string | null)) => {
      setFilters((prev) => {
        const next = typeof value === 'function' ? value(prev.brandId) : value;
        return { ...prev, brandId: next };
      });
    },
    [],
  );

  const greetingName = useMemo(() => {
    if (isLoggedIn && user?.fullName) {
      return user.fullName;
    }

    return 'Mediator Guest';
  }, [isLoggedIn, user?.fullName]);

  const loadListings = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
        const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;

        const res = await fetchListings({
          page: pageNum,
          perPage: 8,
          brandId: filters.brandId || undefined,
          condition: filters.condition === 'all' ? undefined : filters.condition,
          minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
          maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
          sortBy: filters.sortBy,
        });

        const nextItems = res.data ?? [];
        setListings((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setPagination(res.pagination ?? null);
      } catch {
        if (!append) {
          setListings([]);
          setPagination(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  const loadHome = useCallback(async () => {
    try {
      setLoading(true);
      const [brandsRes, featuredRes] = await Promise.allSettled([
        fetchBrands(),
        fetchFeaturedListings(4),
      ]);

      setBrands(brandsRes.status === 'fulfilled' ? brandsRes.value ?? [] : []);
      setFeatured(
        featuredRes.status === 'fulfilled' ? featuredRes.value.data ?? [] : [],
      );
      await loadListings(1);
    } finally {
      setLoading(false);
    }
  }, [loadListings]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  useEffect(() => {
    if (!filterReadyRef.current) {
      filterReadyRef.current = true;
      return;
    }

    setPage(1);
    loadListings(1);
  }, [filters, loadListings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadHome();
    setRefreshing(false);
  }, [loadHome]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadListings(nextPage, true);
    }
  }, [loadListings, loading, loadingMore, page, pagination]);

  const featuredItems = featured.length > 0 ? featured : listings.slice(0, 3);
  const chipBrands = brands.slice(0, 5);

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{greetingName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              {greetingName}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Cari mobil, merek, atau model..."
          onFilterPress={() => setFilterSheetVisible(true)}
        />
      </View>

      {featuredItems.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const cardWidth = width - 40;
              const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
              setActiveBanner(index);
            }}
          >
            {featuredItems.map((item) => {
              const imageUri = getListingImage(item.images);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.86}
                  style={[styles.bannerCard, { width: width - 40 }]}
                  onPress={() => router.push(`/listing/${item.id}`)}
                >
                  <View style={styles.bannerCopy}>
                    <Text style={styles.bannerEyebrow}>Pilihan Mediator</Text>
                    <Text style={styles.bannerTitle}>{getListingTitle(item)}</Text>
                    <Text style={styles.bannerSubtitle}>Siap dihubungi hari ini</Text>
                  </View>
                  <Image
                    source={imageUri ? { uri: imageUri } : require('@/assets/images/onboarding-hero.png')}
                    style={styles.bannerImage}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.bannerDots}>
            {featuredItems.map((_, index) => (
              <View
                key={index}
                style={[styles.bannerDot, index === activeBanner && styles.bannerDotActive]}
              />
            ))}
          </View>
        </View>
      ) : null}

      {brands.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Merek Populer</Text>
          </View>

          <View style={styles.brandGrid}>
            {brands.slice(0, 8).map((brand) => {
              const isActive = selectedBrandId === brand.id;
              const logoUri = resolveImageUrl(brand.logo);

              return (
                <TouchableOpacity
                  key={brand.id}
                  activeOpacity={0.86}
                  style={styles.brandItem}
                  onPress={() => setSelectedBrandId((prev) => (prev === brand.id ? null : brand.id))}
                >
                  <View style={[styles.brandBubble, isActive && styles.brandBubbleActive]}>
                    {logoUri ? (
                      <Image
                        source={{ uri: logoUri }}
                        style={styles.brandLogo}
                        contentFit="contain"
                      />
                    ) : (
                      <Text style={[styles.brandInitial, isActive && styles.brandInitialActive]}>
                        {brand.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.brandLabel} numberOfLines={1}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.section, styles.listSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Deals</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.filterChip, !selectedBrandId && styles.filterChipActive]}
            onPress={() => setSelectedBrandId(null)}
          >
            <Text style={[styles.filterChipText, !selectedBrandId && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          {chipBrands.map((brand) => {
            const active = selectedBrandId === brand.id;
            return (
              <TouchableOpacity
                key={brand.id}
                activeOpacity={0.86}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSelectedBrandId(brand.id)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  if (loading && listings.length === 0 && featured.length === 0) {
    return <LoadingSpinner fullScreen message="Memuat marketplace..." />;
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
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Belum ada listing"
            subtitle="Coba pilih merek lain atau refresh halaman."
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.text} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
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

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(next) => setFilters(next)}
        brands={brands}
        initial={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    maxWidth: 190,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  section: {
    marginTop: 28,
  },
  listSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  bannerEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
  bannerTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -1,
  },
  bannerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.72)',
  },
  bannerImage: {
    width: 136,
    height: 108,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  bannerDotActive: {
    width: 24,
    backgroundColor: Colors.text,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    paddingHorizontal: 20,
  },
  brandItem: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
  },
  brandBubble: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  brandBubbleActive: {
    borderColor: Colors.text,
    backgroundColor: Colors.primarySoft,
  },
  brandLogo: {
    width: 34,
    height: 34,
  },
  brandInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  brandInitialActive: {
    color: Colors.text,
  },
  brandLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
