import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors, { Shadows } from "@/constants/Colors";
import type { Listing } from "@/types";
import { formatRupiah, getListingTitle, getListingImage } from "@/lib/utils";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const CARD_HEIGHT = 200;

interface FeaturedCarouselProps {
  items: Listing[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  if (items.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Pilihan Unggulan</Text>
          <Text style={styles.sectionSubtitle}>Mobil terbaik untuk Anda</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => router.push("/search?featured=true")}
        >
          <Text style={styles.seeAllText}>Lihat Semua</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
      >
        {items.map((item) => {
          const title = getListingTitle(item);
          const imageUri = getListingImage(item.images);
          const variantName = item.variant?.name || "";

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/listing/${item.id}`)}
              style={[styles.card, Shadows.large]}
            >
              <Image
                source={
                  imageUri
                    ? { uri: imageUri }
                    : require("@/assets/images/car-placeholder.png")
                }
                style={styles.image}
                contentFit="cover"
                transition={400}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                style={styles.overlay}
              >
                <View style={styles.cardContent}>
                  <View style={styles.badgeRow}>
                    <View style={styles.yearBadge}>
                      <Text style={styles.yearText}>{item.year}</Text>
                    </View>
                    <View style={styles.featuredBadge}>
                      <Ionicons name="star" size={12} color={Colors.white} />
                      <Text style={styles.featuredText}>Unggulan</Text>
                    </View>
                  </View>
                  <Text style={styles.carTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  {variantName ? (
                    <Text style={styles.carVariant} numberOfLines={1}>
                      {variantName}
                    </Text>
                  ) : null}
                  <View style={styles.bottomRow}>
                    <Text style={styles.carPrice}>
                      {formatRupiah(item.price)}
                    </Text>
                    <View style={styles.locationBadge}>
                      <Ionicons
                        name="location"
                        size={12}
                        color={Colors.white}
                      />
                      <Text style={styles.carLocation}>
                        {item.locationCity}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: "500",
    marginTop: 2,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    justifyContent: "flex-end",
    padding: 16,
  },
  cardContent: {},
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  yearBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  carVariant: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  carPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.accentLight,
    letterSpacing: -0.5,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  carLocation: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
});
