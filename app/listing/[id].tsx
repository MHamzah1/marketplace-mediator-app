import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { requireAuth } from '@/lib/auth/requireAuth';
import {
  fetchListingDetail,
  getWhatsAppLink,
} from '@/lib/api/marketplaceService';
import {
  formatMileage,
  formatRupiahFull,
  getListingTitle,
  resolveImageUrl,
} from '@/lib/utils';
import type { Listing } from '@/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function ListingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoggedIn } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contacting, setContacting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const galleryRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchListingDetail(id)
      .then((response) => {
        setListing(response.data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat detail listing.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const title = useMemo(() => {
    if (!listing) return '';
    return getListingTitle(listing);
  }, [listing]);

  const gallery = useMemo(() => {
    if (!listing) return [];
    return (listing.images || [])
      .map((item) => resolveImageUrl(item))
      .filter(Boolean) as string[];
  }, [listing]);

  const handleShare = async () => {
    if (!listing) return;
    await Share.share({
      title,
      message: `${title} - ${formatRupiahFull(listing.price)} di Mediator`,
    });
  };

  const handleWhatsApp = async () => {
    if (!listing) return;
    if (
      !requireAuth(router, isLoggedIn, {
        redirectTo: `/listing/${listing.id}`,
        reason: 'whatsapp',
        message: 'Masuk dulu untuk menghubungi penjual via WhatsApp.',
      })
    ) {
      return;
    }
    try {
      setContacting(true);
      const response = await getWhatsAppLink(listing.id);
      await Linking.openURL(response.whatsappUrl);
    } catch {
      Alert.alert('Gagal Membuka WhatsApp', 'Silakan coba beberapa saat lagi.');
    } finally {
      setContacting(false);
    }
  };

  const scrollToImage = (index: number) => {
    galleryRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Memuat detail mobil..." />;
  }

  if (!listing || error) {
    return (
      <View style={styles.screen}>
        <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Detail tidak tersedia"
          subtitle={error || 'Listing yang Anda buka tidak ditemukan.'}
          actionLabel="Kembali"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const imageHeight = width * 0.72;

  const specs: { icon: IoniconsName; label: string; value: string }[] = [
    { icon: 'speedometer-outline', label: 'Kilometer', value: formatMileage(listing.mileage) },
    { icon: 'flash-outline', label: 'Bahan Bakar', value: listing.fuelType },
    { icon: 'cog-outline', label: 'Transmisi', value: listing.transmission },
    { icon: 'color-palette-outline', label: 'Warna', value: listing.color || '-' },
    { icon: 'eye-outline', label: 'Dilihat', value: `${listing.viewCount} kali` },
    { icon: 'calendar-outline', label: 'Tahun', value: `${listing.year}` },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite((prev) => !prev)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 108 }}
      >
        {/* Swipeable image gallery */}
        <View style={{ height: imageHeight, backgroundColor: Colors.backgroundSecondary }}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            style={{ flex: 1 }}
          >
            {gallery.length > 0 ? (
              gallery.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={{ width, height: imageHeight }}
                  contentFit="cover"
                  transition={200}
                />
              ))
            ) : (
              <Image
                source={require('@/assets/images/onboarding-hero.png')}
                style={{ width, height: imageHeight }}
                contentFit="cover"
              />
            )}
          </ScrollView>

          {/* Dot indicators */}
          {gallery.length > 1 ? (
            <View style={styles.dotRow}>
              {gallery.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex
                      ? styles.dotActive
                      : { backgroundColor: 'rgba(255,255,255,0.45)' },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {/* Image counter badge */}
          {gallery.length > 1 ? (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {activeIndex + 1}/{gallery.length}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Thumbnail strip */}
        {gallery.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {gallery.map((uri, i) => {
              const active = activeIndex === i;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.82}
                  onPress={() => scrollToImage(i)}
                  style={[styles.thumbnailFrame, active && styles.thumbnailFrameActive]}
                >
                  <Image source={{ uri }} style={styles.thumbnailImage} contentFit="cover" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.body}>
          {/* Meta pills */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{listing.year}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>
                {listing.condition === 'baru' ? 'Baru' : 'Bekas'}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{listing.transmission}</Text>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          {listing.variant?.name || listing.carModel?.modelName ? (
            <Text style={styles.subtitle}>
              {listing.variant?.name || listing.carModel?.modelName}
            </Text>
          ) : null}

          <Text style={styles.price}>{formatRupiahFull(listing.price)}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {listing.locationCity}
              {listing.locationProvince ? `, ${listing.locationProvince}` : ''}
            </Text>
          </View>

          {/* Spec bars */}
          <View style={styles.specSection}>
            <Text style={styles.sectionTitle}>Spesifikasi</Text>
            <View style={styles.specBar}>
              {specs.map((spec, i) => (
                <React.Fragment key={spec.label}>
                  <View style={styles.specRow}>
                    <View style={styles.specLeft}>
                      <View style={styles.specIconWrap}>
                        <Ionicons name={spec.icon} size={14} color={Colors.primary} />
                      </View>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                    </View>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                  {i < specs.length - 1 ? (
                    <View style={styles.specDivider} />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.descriptionText}>
              {listing.description || 'Penjual belum menambahkan deskripsi untuk mobil ini.'}
            </Text>
          </View>

          {/* Seller */}
          {listing.seller ? (
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.sellerRow}
              onPress={() => router.push(`/seller/${listing.seller.id}`)}
            >
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {listing.seller.fullName?.charAt(0).toUpperCase() || 'M'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{listing.seller.fullName}</Text>
                <Text style={styles.sellerSubtitle}>
                  {listing.seller.location || 'Penjual Mediator'} · Verified Seller
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <View>
          <Text style={styles.bottomLabel}>Harga</Text>
          <Text style={styles.bottomPrice}>{formatRupiahFull(listing.price)}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={handleWhatsApp}
          style={styles.whatsAppButton}
        >
          <Ionicons name="logo-whatsapp" size={17} color={Colors.white} />
          <Text style={styles.whatsAppButtonText}>
            {contacting ? 'Memuat...' : 'WhatsApp'}
          </Text>
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
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  dotRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  counterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnailFrame: {
    width: 64,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.backgroundSecondary,
  },
  thumbnailFrameActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  title: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  price: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  specSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  specBar: {
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  specLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primarySoftest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  specDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
  descriptionSection: {
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  sellerRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  sellerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  bottomPrice: {
    marginTop: 1,
    fontSize: 15,
    fontWeight: '900',
    color: Colors.text,
  },
  whatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 18,
    backgroundColor: '#25D366',
  },
  whatsAppButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
});
