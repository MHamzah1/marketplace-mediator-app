import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import SearchBar from '@/components/marketplace/SearchBar';
import ListingCard from '@/components/marketplace/ListingCard';
import { CarListing } from '@/types';

const POPULAR_BRANDS = [
  { id: '1', name: 'Toyota', icon: 'car-sport' as const },
  { id: '2', name: 'Honda', icon: 'car' as const },
  { id: '3', name: 'Mitsubishi', icon: 'car-sport-outline' as const },
  { id: '4', name: 'Suzuki', icon: 'car-outline' as const },
  { id: '5', name: 'Daihatsu', icon: 'car' as const },
  { id: '6', name: 'Hyundai', icon: 'car-sport' as const },
];

const RECENT_SEARCHES = [
  'Toyota Fortuner 2023',
  'Honda CR-V Turbo',
  'Mobil bekas Jakarta',
  'SUV diesel automatic',
];

const ALL_LISTINGS: CarListing[] = [
  {
    id: '10',
    title: 'Toyota Rush GR',
    brand: 'Toyota',
    model: 'Rush',
    variant: 'GR Sport AT',
    year: 2023,
    price: 305000000,
    mileage: 8000,
    fuelType: 'Bensin',
    transmission: 'Automatic',
    color: 'Putih',
    location: 'Jakarta',
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '11',
    title: 'Honda Jazz RS',
    brand: 'Honda',
    model: 'Jazz',
    variant: 'RS CVT',
    year: 2022,
    price: 265000000,
    mileage: 20000,
    fuelType: 'Bensin',
    transmission: 'CVT',
    color: 'Merah',
    location: 'Bandung',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_LISTINGS.filter(
      (item) =>
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q),
    );
  }, [query]);

  const hasQuery = query.trim().length > 0;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Popular Brands */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Merk Populer</Text>
        <View style={styles.brandsGrid}>
          {POPULAR_BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={[styles.brandChip, Shadows.small]}
              onPress={() => setQuery(brand.name)}
            >
              <View style={styles.brandIconBg}>
                <Ionicons name={brand.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Searches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pencarian Terbaru</Text>
        {RECENT_SEARCHES.map((term, i) => (
          <TouchableOpacity
            key={i}
            style={styles.recentItem}
            onPress={() => setQuery(term)}
          >
            <Ionicons name="time-outline" size={18} color={Colors.textTertiary} />
            <Text style={styles.recentText}>{term}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <View style={styles.noResultsIcon}>
        <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
      </View>
      <Text style={styles.noResultsTitle}>Tidak Ditemukan</Text>
      <Text style={styles.noResultsText}>
        Coba gunakan kata kunci yang berbeda
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
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
      ) : filteredResults.length === 0 ? (
        renderNoResults()
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard item={item} variant="horizontal" />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filteredResults.length} hasil ditemukan
            </Text>
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
  resultCount: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
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
  brandIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
