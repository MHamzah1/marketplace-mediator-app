import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import ListingCard from '@/components/marketplace/ListingCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { Listing, SellerProfile, Pagination } from '@/types';
import { fetchSellerProfile, fetchListings } from '@/lib/api/marketplaceService';
import { timeAgo } from '@/lib/utils';

export default function SellerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, listingsRes] = await Promise.all([
        fetchSellerProfile(id!),
        fetchListings({ sellerId: id, page: 1, perPage: 10 } as never),
      ]);
      setSeller(profileRes.data);
      setListings(listingsRes.data ?? []);
      setPagination(listingsRes.pagination ?? null);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (pagination && page < pagination.totalPages) {
      const next = page + 1;
      setPage(next);
      setLoadingMore(true);
      fetchListings({ sellerId: id, page: next, perPage: 10 } as never)
        .then((res) => {
          setListings((prev) => [...prev, ...(res.data ?? [])]);
          setPagination(res.pagination ?? null);
        })
        .catch(() => {})
        .finally(() => setLoadingMore(false));
    }
  }, [loadingMore, loading, pagination, page, id]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <LoadingSpinner fullScreen message="Memuat profil..." />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Seller Info */}
      {seller && (
        <View style={[styles.sellerCard, Shadows.medium]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{seller.fullName?.charAt(0) || '?'}</Text>
            </View>
          </View>
          <Text style={styles.sellerName}>{seller.fullName}</Text>
          {seller.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.textTertiary} />
              <Text style={styles.locationText}>{seller.location}</Text>
            </View>
          )}
          <View style={styles.sellerStats}>
            <View style={styles.sellerStat}>
              <Text style={styles.sellerStatValue}>{seller.totalListings}</Text>
              <Text style={styles.sellerStatLabel}>Listing</Text>
            </View>
            <View style={styles.sellerStatDivider} />
            <View style={styles.sellerStat}>
              <Text style={styles.sellerStatValue}>
                {new Date(seller.createdAt).getFullYear()}
              </Text>
              <Text style={styles.sellerStatLabel}>Bergabung</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.listingHeader}>
        Listing ({pagination?.totalRecords || listings.length})
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Penjual</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState icon="car-outline" title="Belum Ada Listing" subtitle="Penjual belum memiliki listing" />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sellerCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    margin: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 24,
  },
  sellerStat: {
    alignItems: 'center',
  },
  sellerStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  sellerStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sellerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  listingHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
