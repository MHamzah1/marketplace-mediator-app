import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { Shadows } from '@/constants/Colors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { Listing } from '@/types';
import { fetchListingDetail, getWhatsAppLink } from '@/lib/api/marketplaceService';
import { requireAuth } from '@/lib/auth/requireAuth';
import { useAuth } from '@/context/AuthContext';
import {
  formatRupiahFull,
  formatMileage,
  getListingTitle,
  resolveImageUrl,
  timeAgo,
} from '@/lib/utils';

const { width } = Dimensions.get('window');

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function ListingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoggedIn } = useAuth();

  const [car, setCar] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchListingDetail(id!);
      setCar(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat detail listing';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!car) return;
    const title = getListingTitle(car);
    await Share.share({
      title: `${title} ${car.variant?.name || ''}`,
      message: `Lihat ${title} ${car.variant?.name || ''} seharga ${formatRupiahFull(car.price)} di Mediator!`,
    });
  };

  const handleContact = async () => {
    if (!car) return;
    if (
      !requireAuth(router, isLoggedIn, {
        redirectTo: `/listing/${car.id}`,
        reason: 'whatsapp',
        message: 'Masuk dulu untuk melihat nomor dan menghubungi penjual via WhatsApp.',
      })
    ) {
      return;
    }

    try {
      setContacting(true);
      const res = await getWhatsAppLink(car.id);
      if (res.whatsappUrl) {
        await Linking.openURL(res.whatsappUrl);
      }
    } catch {
      Alert.alert('Error', 'Gagal mendapatkan link WhatsApp penjual');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <LoadingSpinner fullScreen message="Memuat detail..." />
      </View>
    );
  }

  if (error || !car) {
    return (
      <View style={styles.screen}>
        <View style={[styles.floatingHeader, { paddingTop: insets.top + 4 }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Gagal Memuat"
          subtitle={error || 'Listing tidak ditemukan'}
          actionLabel="Coba Lagi"
          onAction={loadDetail}
        />
      </View>
    );
  }

  const title = getListingTitle(car);
  const variantName = car.variant?.name || '';
  const images = (car.images || []).map((img) => resolveImageUrl(img)).filter(Boolean) as string[];
  const sellerInitial = car.seller?.fullName?.charAt(0) || '?';

  const specs: { label: string; value: string; icon: IoniconsName }[] = [
    { label: 'Transmisi', value: car.transmission, icon: 'cog' },
    { label: 'Bahan Bakar', value: car.fuelType, icon: 'flash' },
    { label: 'Kilometer', value: formatMileage(car.mileage), icon: 'speedometer' },
    { label: 'Warna', value: car.color, icon: 'color-palette' },
    { label: 'Kondisi', value: car.condition === 'baru' ? 'Baru' : 'Bekas', icon: 'car' },
    { label: 'Tahun', value: String(car.year), icon: 'calendar' },
  ];

  return (
    <View style={styles.screen}>
      {/* Floating Header */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
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
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width));
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
          ) : (
            <Image
              source={require('@/assets/images/car-placeholder.png')}
              style={styles.carouselImage}
              contentFit="cover"
            />
          )}
          {images.length > 1 && (
            <>
              <View style={styles.dotsContainer}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, activeImageIndex === i && styles.dotActive]}
                  />
                ))}
              </View>
              <View style={styles.imageCounter}>
                <Ionicons name="image" size={14} color={Colors.white} />
                <Text style={styles.imageCounterText}>
                  {activeImageIndex + 1}/{images.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.conditionRow}>
            <View style={styles.yearBadge}>
              <Text style={styles.yearBadgeText}>{car.year}</Text>
            </View>
            <View style={styles.mileageBadge}>
              <Ionicons name="speedometer-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.mileageBadgeText}>{formatMileage(car.mileage)}</Text>
            </View>
            {car.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color={Colors.white} />
                <Text style={styles.featuredBadgeText}>Unggulan</Text>
              </View>
            )}
          </View>
          <Text style={styles.carTitle}>{title}</Text>
          {variantName ? <Text style={styles.carVariant}>{variantName}</Text> : null}
          <Text style={styles.carPrice}>{formatRupiahFull(car.price)}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>
              {car.locationCity}{car.locationProvince ? `, ${car.locationProvince}` : ''}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.statText}>{car.viewCount} dilihat</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.statText}>{timeAgo(car.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spesifikasi</Text>
          <View style={styles.specsGrid}>
            {specs.map((spec, i) => (
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

        {/* Description */}
        {car.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <View style={[styles.descCard, Shadows.small]}>
              <Text style={styles.descText}>{car.description}</Text>
            </View>
          </View>
        ) : null}

        {/* Seller Info */}
        {car.seller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Penjual</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/seller/${car.seller.id}`)}
              style={[styles.sellerCard, Shadows.medium]}
            >
              <View style={styles.sellerRow}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>{sellerInitial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{car.seller.fullName}</Text>
                  </View>
                  <Text style={styles.sellerMeta}>
                    {car.seller.location || car.locationCity} · Member sejak{' '}
                    {new Date(car.seller.createdAt).getFullYear()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Harga</Text>
          <Text style={styles.bottomPrice}>{formatRupiahFull(car.price)}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ flex: 1 }}
          onPress={handleContact}
          disabled={contacting}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.contactBtn, Shadows.blue]}
          >
            <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
            <Text style={styles.contactBtnText}>
              {contacting ? 'Memuat...' : isLoggedIn ? 'WhatsApp' : 'Masuk untuk WhatsApp'}
            </Text>
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
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textTertiary,
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
