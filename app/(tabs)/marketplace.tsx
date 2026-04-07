import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientHeader from '@/components/ui/GradientHeader';
import SearchBar from '@/components/marketplace/SearchBar';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import FeaturedCarousel from '@/components/marketplace/FeaturedCarousel';
import ListingCard from '@/components/marketplace/ListingCard';
import Colors from '@/constants/Colors';
import { CarListing } from '@/types';

// Demo data
const DEMO_FEATURED: CarListing[] = [
  {
    id: '1',
    title: 'Toyota Fortuner VRZ',
    brand: 'Toyota',
    model: 'Fortuner',
    variant: 'VRZ 2.4 AT',
    year: 2023,
    price: 585000000,
    mileage: 12000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    color: 'Putih',
    location: 'Jakarta Selatan',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    condition: 'bekas',
    status: 'active',
    isFeatured: true,
    isBoosted: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    seller: { id: '1', name: 'Auto Gallery', verified: true },
  },
  {
    id: '2',
    title: 'Honda CR-V Turbo',
    brand: 'Honda',
    model: 'CR-V',
    variant: '1.5 Turbo Prestige',
    year: 2024,
    price: 620000000,
    mileage: 5000,
    fuelType: 'Bensin',
    transmission: 'Automatic',
    color: 'Hitam',
    location: 'Bandung',
    images: ['https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=400',
    condition: 'bekas',
    status: 'active',
    isFeatured: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    seller: { id: '2', name: 'Premium Cars', verified: true },
  },
  {
    id: '3',
    title: 'Mitsubishi Pajero Sport',
    brand: 'Mitsubishi',
    model: 'Pajero Sport',
    variant: 'Dakar Ultimate 4x2',
    year: 2023,
    price: 560000000,
    mileage: 18000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    color: 'Silver',
    location: 'Surabaya',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    condition: 'bekas',
    status: 'active',
    isFeatured: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    seller: { id: '3', name: 'Maju Motor', verified: false },
  },
];

const DEMO_LISTINGS: CarListing[] = [
  {
    id: '4',
    title: 'Toyota Avanza Veloz',
    brand: 'Toyota',
    model: 'Avanza',
    variant: 'Veloz 1.5 Q CVT TSS',
    year: 2023,
    price: 295000000,
    mileage: 15000,
    fuelType: 'Bensin',
    transmission: 'CVT',
    color: 'Putih',
    location: 'Jakarta Barat',
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '5',
    title: 'Honda Brio RS',
    brand: 'Honda',
    model: 'Brio',
    variant: 'RS Urbanite CVT',
    year: 2024,
    price: 235000000,
    mileage: 3000,
    fuelType: 'Bensin',
    transmission: 'CVT',
    color: 'Merah',
    location: 'Tangerang',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '6',
    title: 'Daihatsu Xenia',
    brand: 'Daihatsu',
    model: 'Xenia',
    variant: '1.5 R Deluxe MT',
    year: 2022,
    price: 215000000,
    mileage: 28000,
    fuelType: 'Bensin',
    transmission: 'Manual',
    color: 'Abu-abu',
    location: 'Bekasi',
    images: ['https://images.unsplash.com/photo-1542362567-b07e54358753?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '7',
    title: 'Suzuki Ertiga GX',
    brand: 'Suzuki',
    model: 'Ertiga',
    variant: 'GX AT',
    year: 2023,
    price: 255000000,
    mileage: 10000,
    fuelType: 'Bensin',
    transmission: 'Automatic',
    color: 'Putih',
    location: 'Depok',
    images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '8',
    title: 'Hyundai Creta Prime',
    brand: 'Hyundai',
    model: 'Creta',
    variant: 'Prime IVT',
    year: 2024,
    price: 380000000,
    mileage: 2000,
    fuelType: 'Bensin',
    transmission: 'IVT',
    color: 'Biru',
    location: 'Jakarta Utara',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '9',
    title: 'Wuling Air EV',
    brand: 'Wuling',
    model: 'Air EV',
    variant: 'Long Range Luxury',
    year: 2024,
    price: 295000000,
    mileage: 1500,
    fuelType: 'Listrik',
    transmission: 'Automatic',
    color: 'Hijau',
    location: 'Bogor',
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
    thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
    condition: 'bekas',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

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

      <FeaturedCarousel items={DEMO_FEATURED} />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Terbaru</Text>
        <Text style={styles.listSubtitle}>{DEMO_LISTINGS.length} mobil tersedia</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={DEMO_LISTINGS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ListingCard item={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
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
});
