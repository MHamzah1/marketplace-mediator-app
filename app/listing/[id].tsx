import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';

const { width } = Dimensions.get('window');

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Demo detail data
const DEMO_CAR = {
  id: '1',
  brand: 'Toyota',
  model: 'Fortuner',
  variant: 'VRZ 2.4 AT Diesel',
  year: 2023,
  price: 585000000,
  mileage: 12000,
  fuelType: 'Diesel',
  transmission: 'Automatic',
  color: 'Putih Mutiara',
  location: 'Jakarta Selatan',
  description:
    'Toyota Fortuner VRZ 2.4 AT Diesel tahun 2023 kondisi sangat terawat. Servis record resmi Toyota. Interior bersih dan wangi. Ban masih tebal. Bebas banjir dan tabrakan. Surat-surat lengkap dan pajak hidup sampai 2025.',
  images: [
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    'https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  ],
  seller: {
    name: 'Auto Gallery Premium',
    verified: true,
    avatar: null,
    phone: '+62 812-3456-7890',
    location: 'Jakarta Selatan',
    totalListings: 24,
    memberSince: '2022',
  },
  features: [
    'Sunroof',
    'Leather Seat',
    'Keyless Entry',
    'Push Start',
    'Cruise Control',
    'Hill Start Assist',
    'Rear Camera',
    'Apple CarPlay',
  ],
  specs: [
    { label: 'Mesin', value: '2.4L Turbo Diesel', icon: 'settings' as IoniconsName },
    { label: 'Tenaga', value: '150 HP', icon: 'flash' as IoniconsName },
    { label: 'Torsi', value: '400 Nm', icon: 'speedometer' as IoniconsName },
    { label: 'Kapasitas', value: '7 Penumpang', icon: 'people' as IoniconsName },
    { label: 'Transmisi', value: 'AT 6-Speed', icon: 'cog' as IoniconsName },
    { label: 'Penggerak', value: '4x2 (RWD)', icon: 'car' as IoniconsName },
  ],
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const car = DEMO_CAR;

  const handleShare = async () => {
    await Share.share({
      title: `${car.brand} ${car.model} ${car.variant}`,
      message: `Lihat ${car.brand} ${car.model} ${car.variant} seharga Rp ${car.price.toLocaleString('id-ID')} di Mediator!`,
    });
  };

  return (
    <View style={styles.screen}>
      {/* Floating Header */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Image Carousel */}
        <View>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImageIndex(
                Math.round(e.nativeEvent.contentOffset.x / width),
              );
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.carouselImage}
                contentFit="cover"
                transition={300}
              />
            )}
            keyExtractor={(_, i) => i.toString()}
          />
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {car.images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  activeImageIndex === i && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.imageCounter}>
            <Ionicons name="image" size={14} color={Colors.white} />
            <Text style={styles.imageCounterText}>
              {activeImageIndex + 1}/{car.images.length}
            </Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.conditionRow}>
            <View style={styles.yearBadge}>
              <Text style={styles.yearBadgeText}>{car.year}</Text>
            </View>
            <View style={styles.mileageBadge}>
              <Ionicons name="speedometer-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.mileageBadgeText}>{(car.mileage / 1000).toFixed(0)}rb km</Text>
            </View>
          </View>
          <Text style={styles.carTitle}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.carVariant}>{car.variant}</Text>
          <Text style={styles.carPrice}>Rp {car.price.toLocaleString('id-ID')}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>{car.location}</Text>
          </View>
        </View>

        {/* Quick Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spesifikasi</Text>
          <View style={styles.specsGrid}>
            {car.specs.map((spec, i) => (
              <View key={i} style={[styles.specItem, Shadows.small]}>
                <View style={styles.specIconBg}>
                  <Ionicons name={spec.icon} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur</Text>
          <View style={styles.featuresGrid}>
            {car.features.map((feat, i) => (
              <View key={i} style={styles.featureChip}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.featureChipText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <View style={[styles.descCard, Shadows.small]}>
            <Text style={styles.descText}>{car.description}</Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penjual</Text>
          <View style={[styles.sellerCard, Shadows.medium]}>
            <View style={styles.sellerRow}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {car.seller.name.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{car.seller.name}</Text>
                  {car.seller.verified && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </View>
                <Text style={styles.sellerMeta}>
                  {car.seller.totalListings} listing | Member sejak {car.seller.memberSince}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Harga</Text>
          <Text style={styles.bottomPrice}>Rp {car.price.toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={{ flex: 1 }}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.contactBtn, Shadows.blue]}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
            <Text style={styles.contactBtnText}>Hubungi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  carouselImage: {
    width,
    height: width * 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: -24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.white,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 36,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  mainInfo: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Shadows.small,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  yearBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  yearBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  mileageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mileageBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  carVariant: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  carPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 12,
    letterSpacing: -0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specItem: {
    width: (width - 50) / 3,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  specIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  featureChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  descCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  descText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  sellerCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sellerMeta: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.medium,
  },
  bottomPriceContainer: {},
  bottomPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
  },
  contactBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
});
