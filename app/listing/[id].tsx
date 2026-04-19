import React, { useEffect, useMemo, useState } from 'react';
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
import Colors, { Shadows } from '@/constants/Colors';
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

export default function ListingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoggedIn } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [contacting, setContacting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const selectedImage = gallery[selectedImageIndex];

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}
      >
        <View style={[styles.heroWrap, { height: width * 0.82 }]}>
          <Image
            source={selectedImage ? { uri: selectedImage } : require('@/assets/images/onboarding-hero.png')}
            style={styles.heroImage}
            contentFit="cover"
            transition={250}
          />
          <View style={styles.viewerBadge}>
            <Text style={styles.viewerBadgeText}>360°</Text>
          </View>
        </View>

        {gallery.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {gallery.map((image, index) => {
              const active = selectedImageIndex === index;
              return (
                <TouchableOpacity
                  key={image + index}
                  activeOpacity={0.86}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[styles.thumbnailFrame, active && styles.thumbnailFrameActive]}
                >
                  <Image source={{ uri: image }} style={styles.thumbnailImage} contentFit="cover" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.body}>
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
          <Text style={styles.subtitle}>
            {listing.variant?.name || listing.carModel?.modelName}
          </Text>
          <Text style={styles.price}>{formatRupiahFull(listing.price)}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {listing.locationCity}
              {listing.locationProvince ? `, ${listing.locationProvince}` : ''}
            </Text>
          </View>

          <View style={styles.specGrid}>
            {[
              { icon: 'speedometer-outline' as const, label: 'Kilometer', value: formatMileage(listing.mileage) },
              { icon: 'flash-outline' as const, label: 'Bahan Bakar', value: listing.fuelType },
              { icon: 'color-palette-outline' as const, label: 'Warna', value: listing.color || '-' },
              { icon: 'eye-outline' as const, label: 'Dilihat', value: `${listing.viewCount}` },
            ].map((spec) => (
              <View key={spec.label} style={[styles.specCard, Shadows.small]}>
                <View style={styles.specIcon}>
                  <Ionicons name={spec.icon} size={18} color={Colors.text} />
                </View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {listing.description || 'Penjual belum menambahkan deskripsi untuk mobil ini.'}
            </Text>
          </View>

          {listing.seller ? (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[styles.sellerCard, Shadows.small]}
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
                  {listing.seller.location || 'Penjual Mediator'} • Verified Seller
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomLabel}>Harga</Text>
          <Text style={styles.bottomPrice}>{formatRupiahFull(listing.price)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={handleWhatsApp}
          style={[styles.whatsAppButton, Shadows.blue]}
        >
          <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
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
    gap: 10,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  heroWrap: {
    backgroundColor: Colors.backgroundSecondary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  viewerBadge: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.white,
  },
  thumbnailRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  thumbnailFrame: {
    width: 78,
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.backgroundSecondary,
  },
  thumbnailFrameActive: {
    borderColor: Colors.text,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  title: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  price: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 24,
  },
  specCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 16,
  },
  specIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  specValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  descriptionSection: {
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  sellerCard: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 16,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sellerSubtitle: {
    marginTop: 4,
    fontSize: 13,
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
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bottomLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  bottomPrice: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  whatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: Colors.primary,
  },
  whatsAppButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});
