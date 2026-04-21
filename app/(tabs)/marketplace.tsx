import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FilterSheet, {
  DEFAULT_FILTERS,
  type MarketplaceFilters,
} from "@/components/marketplace/FilterSheet";
import ListingCard from "@/components/marketplace/ListingCard";
import SearchBar from "@/components/marketplace/SearchBar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchBrands } from "@/lib/api/brandService";
import {
  fetchFeaturedListings,
  fetchListings,
} from "@/lib/api/marketplaceService";
import { resolveImageUrl, getListingTitle, getListingImage } from "@/lib/utils";
import type { Brand, Listing, Pagination } from "@/types";

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeBanner, setActiveBanner] = useState(0);
  const filterReadyRef = useRef(false);

  const BANNER_GRADIENTS: [string, string][] = [
    ["#FF6B35", "#C0392B"],
    ["#6C5CE7", "#A29BFE"],
    ["#00B4D8", "#0077B6"],
    ["#E91E8C", "#9B1166"],
  ];

  const selectedBrandId = filters.brandId;
  const setSelectedBrandId = useCallback(
    (value: string | null | ((prev: string | null) => string | null)) => {
      setFilters((prev) => {
        const next = typeof value === "function" ? value(prev.brandId) : value;
        return { ...prev, brandId: next };
      });
    },
    [],
  );

  const greetingName = useMemo(() => {
    if (isLoggedIn && user?.fullName) {
      return user.fullName;
    }
    return "Mediator";
  }, [isLoggedIn, user?.fullName]);

  const buildListingParams = useCallback((f: MarketplaceFilters) => {
    const minPrice = f.minPrice ? Number(f.minPrice) : undefined;
    const maxPrice = f.maxPrice ? Number(f.maxPrice) : undefined;
    const yearMin = f.yearMin ? Number(f.yearMin) : undefined;
    const yearMax = f.yearMax ? Number(f.yearMax) : undefined;

    return {
      brandId: f.brandId || undefined,
      condition: f.condition === "all" ? undefined : f.condition,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      yearMin: Number.isFinite(yearMin) ? yearMin : undefined,
      yearMax: Number.isFinite(yearMax) ? yearMax : undefined,
      transmission: f.transmission === "all" ? undefined : f.transmission,
      fuelType: f.fuelType === "all" ? undefined : f.fuelType,
      locationCity: f.locationCity ? f.locationCity : undefined,
      periode: f.periode === "all" ? undefined : f.periode,
      sortBy: f.sortBy,
    };
  }, []);

  const loadListings = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const res = await fetchListings({
          page: pageNum,
          perPage: 8,
          ...buildListingParams(filters),
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
    [buildListingParams, filters],
  );

  const loadHome = useCallback(async () => {
    try {
      setLoading(true);
      const [brandsRes, featuredRes] = await Promise.allSettled([
        fetchBrands({ page: 1, perPage: 100 }),
        fetchFeaturedListings(4),
      ]);

      setBrands(
        brandsRes.status === "fulfilled" ? (brandsRes.value ?? []) : [],
      );
      setFeatured(
        featuredRes.status === "fulfilled"
          ? (featuredRes.value.data ?? [])
          : [],
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
  const brandGrid = brands.slice(0, 8);
  const chipBrands = brands.slice(0, 6);

  const bannerWidth = width - 32;

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>
              {greetingName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.greeting, { color: colors.textTertiary }]}>
              Halo
            </Text>
            <Text
              style={[styles.greetingName, { color: colors.text }]}
              numberOfLines={1}
            >
              {greetingName}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons name="heart-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder="Cari mobil, merek, atau model..."
          onFilterPress={() => setFilterSheetVisible(true)}
        />
      </View>

      {brandGrid.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Merek
            </Text>
            {brands.length > brandGrid.length ? (
              <TouchableOpacity onPress={() => setFilterSheetVisible(true)}>
                <Text style={[styles.sectionLink, { color: colors.primary }]}>
                  Lihat Semua
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.brandGrid}>
            {brandGrid.map((brand) => {
              const isActive = selectedBrandId === brand.id;
              const logoUri = resolveImageUrl(brand.logo);

              return (
                <TouchableOpacity
                  key={brand.id}
                  activeOpacity={0.86}
                  style={styles.brandItem}
                  onPress={() =>
                    setSelectedBrandId((prev) =>
                      prev === brand.id ? null : brand.id,
                    )
                  }
                >
                  <View
                    style={[
                      styles.brandBubble,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: "transparent",
                      },
                      isActive && {
                        backgroundColor: colors.primarySoft,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    {logoUri ? (
                      <Image
                        source={{ uri: logoUri }}
                        style={styles.brandLogo}
                        contentFit="contain"
                      />
                    ) : (
                      <Text
                        style={[styles.brandInitial, { color: colors.text }]}
                      >
                        {brand.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.brandLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {featuredItems.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Penawaran Spesial
            </Text>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const cardWidth = bannerWidth;
              const index = Math.round(
                event.nativeEvent.contentOffset.x / cardWidth,
              );
              setActiveBanner(index);
            }}
          >
            {featuredItems.map((item, index) => {
              const imageUri = getListingImage(item.images);
              const grad = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.86}
                  style={[styles.bannerCard, { width: bannerWidth }]}
                  onPress={() => router.push(`/listing/${item.id}`)}
                >
                  <LinearGradient
                    colors={grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.bannerCopy}>
                    <Text
                      style={[
                        styles.bannerEyebrow,
                        { color: "rgba(255,255,255,0.72)" },
                      ]}
                    >
                      Pilihan Mediator
                    </Text>
                    <Text
                      style={[styles.bannerTitle, { color: colors.white }]}
                      numberOfLines={2}
                    >
                      {getListingTitle(item)}
                    </Text>
                    <Text
                      style={[
                        styles.bannerSubtitle,
                        { color: "rgba(255,255,255,0.72)" },
                      ]}
                    >
                      Siap dihubungi hari ini
                    </Text>
                  </View>
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require("@/assets/images/onboarding-hero.png")
                    }
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
                style={[
                  styles.bannerDot,
                  { backgroundColor: colors.border },
                  index === activeBanner && {
                    backgroundColor: colors.primary,
                    width: 18,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.section, styles.listSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Rekomendasi
          </Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>
              Lihat Semua
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            activeOpacity={0.86}
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedBrandId
                  ? colors.primary
                  : colors.background,
                borderColor: !selectedBrandId ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedBrandId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: !selectedBrandId ? colors.white : colors.textSecondary,
                },
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>

          {chipBrands.map((brand) => {
            const active = selectedBrandId === brand.id;
            return (
              <TouchableOpacity
                key={brand.id}
                activeOpacity={0.86}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedBrandId(brand.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? colors.white : colors.textSecondary },
                  ]}
                >
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
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
              <ActivityIndicator size="small" color={colors.primary} />
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
            colors={[colors.primary]}
            tintColor={colors.primary}
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
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "900",
  },
  greeting: {
    fontSize: 11,
    fontWeight: "700",
  },
  greetingName: {
    fontSize: 15,
    fontWeight: "800",
    maxWidth: 190,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  section: {
    marginTop: 18,
  },
  listSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "800",
  },
  bannerCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bannerTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  bannerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  bannerImage: {
    width: 92,
    height: 70,
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    paddingHorizontal: 16,
  },
  brandItem: {
    width: "22%",
    alignItems: "center",
    gap: 6,
  },
  brandBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  brandLogo: {
    width: 30,
    height: 30,
  },
  brandInitial: {
    fontSize: 18,
    fontWeight: "900",
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
