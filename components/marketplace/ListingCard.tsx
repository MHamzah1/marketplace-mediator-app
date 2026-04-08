import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors, { Shadows } from '@/constants/Colors';
import type { Listing } from '@/types';
import { formatRupiah, formatMileage, getListingTitle, getListingImage } from '@/lib/utils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ListingCardProps {
  item: Listing;
  variant?: 'grid' | 'horizontal';
}

export default function ListingCard({ item, variant = 'grid' }: ListingCardProps) {
  const router = useRouter();
  const title = getListingTitle(item);
  const imageUri = getListingImage(item.images);
  const variantName = item.variant?.name || '';

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/listing/${item.id}`)}
        style={[styles.horizontalCard, Shadows.medium]}
      >
        <Image
          source={imageUri ? { uri: imageUri } : require('@/assets/images/car-placeholder.png')}
          style={styles.horizontalImage}
          contentFit="cover"
          transition={300}
        />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={Colors.white} />
            <Text style={styles.featuredText}>Unggulan</Text>
          </View>
        )}
        <View style={styles.horizontalContent}>
          <Text style={styles.brand} numberOfLines={1}>{title}</Text>
          <Text style={styles.variant} numberOfLines={1}>
            {variantName ? `${variantName} · ${item.year}` : `${item.year}`}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Ionicons name="speedometer-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.infoText}>{formatMileage(item.mileage)}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="cog-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.infoText}>{item.transmission}</Text>
            </View>
          </View>
          <Text style={styles.price}>{formatRupiah(item.price)}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.locationText} numberOfLines={1}>{item.locationCity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/listing/${item.id}`)}
      style={[styles.gridCard, Shadows.medium]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : require('@/assets/images/car-placeholder.png')}
          style={styles.gridImage}
          contentFit="cover"
          transition={300}
        />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={Colors.white} />
            <Text style={styles.featuredText}>Unggulan</Text>
          </View>
        )}
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{item.year}</Text>
        </View>
      </View>

      <View style={styles.gridContent}>
        <Text style={styles.brand} numberOfLines={1}>{title}</Text>
        <Text style={styles.variant} numberOfLines={1}>
          {variantName || item.transmission}
        </Text>
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoText}>{item.transmission}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoText}>{item.fuelType}</Text>
          </View>
        </View>
        <Text style={styles.price}>{formatRupiah(item.price)}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={Colors.textTertiary} />
          <Text style={styles.locationText} numberOfLines={1}>{item.locationCity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: CARD_WIDTH, backgroundColor: Colors.card, borderRadius: 18,
    overflow: 'hidden', marginBottom: 16,
  },
  imageContainer: { position: 'relative' },
  gridImage: { width: '100%', height: CARD_WIDTH * 0.7, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  gridContent: { padding: 12 },
  horizontalCard: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 18,
    overflow: 'hidden', marginHorizontal: 16, marginBottom: 12,
  },
  horizontalImage: { width: 140, height: 130 },
  horizontalContent: { flex: 1, padding: 12, justifyContent: 'center' },
  featuredBadge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  featuredText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  yearBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  yearText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  brand: { fontSize: 14, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  variant: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  infoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  infoText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  price: { fontSize: 16, fontWeight: '900', color: Colors.primary, marginTop: 8, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locationText: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', flex: 1 },
  warning: '#F59E0B',
});
