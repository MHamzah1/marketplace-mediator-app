import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { Listing, MyListingsSummary, Pagination } from '@/types';
import { fetchMyListings, deleteListing } from '@/lib/api/marketplaceService';
import { formatRupiah, getListingTitle, getListingImage, timeAgo } from '@/lib/utils';

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<Listing[]>([]);
  const [summary, setSummary] = useState<MyListingsSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async (pageNum: number, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const res = await fetchMyListings({ page: pageNum, perPage: 10 });
      const items = res.data ?? [];

      if (append) {
        setListings((prev) => [...prev, ...items]);
      } else {
        setListings(items);
      }
      setPagination(res.pagination ?? null);
      setSummary(res.summary ?? null);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadData(1);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadData(1);
    setRefreshing(false);
  }, [loadData]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (pagination && page < pagination.totalPages) {
      const next = page + 1;
      setPage(next);
      loadData(next, true);
    }
  }, [loadingMore, loading, pagination, page, loadData]);

  const handleDelete = (item: Listing) => {
    Alert.alert(
      'Hapus Listing',
      `Yakin ingin menghapus ${getListingTitle(item)}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(item.id);
              setListings((prev) => prev.filter((l) => l.id !== item.id));
            } catch {
              Alert.alert('Error', 'Gagal menghapus listing');
            }
          },
        },
      ],
    );
  };

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <View style={styles.summaryRow}>
        {[
          { label: 'Aktif', value: summary.totalActiveListings, color: Colors.success },
          { label: 'Nonaktif', value: summary.totalInactiveListings, color: Colors.textTertiary },
          { label: 'Dilihat', value: summary.totalViews, color: Colors.primary },
          { label: 'Kontak', value: summary.totalContactClicks, color: Colors.accent },
        ].map((s, i) => (
          <View key={i} style={[styles.summaryCard, Shadows.small]}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const title = getListingTitle(item);
    const imageUri = getListingImage(item.images);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/listing/${item.id}`)}
        style={[styles.listingCard, Shadows.small]}
      >
        <Image
          source={imageUri ? { uri: imageUri } : require('@/assets/images/car-placeholder.png')}
          style={styles.listingImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.listingContent}>
          <View style={styles.listingTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listingTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.listingVariant} numberOfLines={1}>
                {item.variant?.name || item.transmission} · {item.year}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? Colors.successLight : Colors.backgroundSecondary }]}>
              <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.textTertiary }]}>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </Text>
            </View>
          </View>
          <Text style={styles.listingPrice}>{formatRupiah(item.price)}</Text>
          <View style={styles.listingStats}>
            <View style={styles.statPill}>
              <Ionicons name="eye-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.statPillText}>{item.viewCount}</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="call-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.statPillText}>{item.contactClickCount}</Text>
            </View>
            <Text style={styles.listingTime}>{timeAgo(item.createdAt)}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push(`/create-listing?editId=${item.id}`)}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && listings.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Saya</Text>
          <View style={{ width: 40 }} />
        </View>
        <LoadingSpinner message="Memuat listing..." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing Saya</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/create-listing')}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={renderSummary}
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Belum Ada Listing"
            subtitle="Mulai jual mobil Anda sekarang"
            actionLabel="Pasang Iklan"
            onAction={() => router.push('/create-listing')}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  listingImage: {
    width: 120,
    height: '100%',
    minHeight: 140,
  },
  listingContent: {
    flex: 1,
    padding: 12,
  },
  listingTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  listingVariant: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 6,
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  listingTime: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primarySoftest,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
