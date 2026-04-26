import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors, { Shadows } from "@/constants/Colors";
import type { Listing } from "@/types";
import {
  formatTransmissionLabel,
  formatMileage,
  formatRupiah,
  getListingImage,
  getListingTitleListing,
} from "@/lib/utils";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface ListingCardProps {
  item: Listing;
  variant?: "grid" | "horizontal";
}

export default function ListingCard({
  item,
  variant = "grid",
}: ListingCardProps) {
  const router = useRouter();
  const title = getListingTitleListing(item);
  const imageUri = getListingImage(item.images);
  const variantName = item.variant?.name || "";
  const conditionLabel = item.condition === "baru" ? "Baru" : "Bekas";
  const transmissionLabel = formatTransmissionLabel(item.transmission);

  if (variant === "horizontal") {
    return (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => router.push(`/listing/${item.id}`)}
        style={[styles.horizontalCard, Shadows.medium]}
      >
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/onboarding-hero.png")
          }
          style={styles.horizontalImage}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.horizontalContent}>
          <View style={styles.topMetaRow}>
            <View style={styles.yearCapsule}>
              <Text style={styles.yearCapsuleText}>{item.year}</Text>
            </View>
            <View style={styles.heartButton}>
              <Ionicons name="heart-outline" size={16} color={Colors.text} />
            </View>
          </View>

          <Text style={styles.brand} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.variant} numberOfLines={1}>
            {variantName || transmissionLabel}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Text style={styles.infoText}>{conditionLabel}</Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoText}>{transmissionLabel}</Text>
            </View>
          </View>

          <Text style={styles.price}>{formatRupiah(item.price)}</Text>

          <View style={styles.bottomMetaRow}>
            <View style={styles.ratingRow}>
              <Ionicons
                name="speedometer-outline"
                size={12}
                color={Colors.textTertiary}
              />
              <Text style={styles.locationText}>
                {formatMileage(item.mileage)}
              </Text>
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.locationCity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={() => router.push(`/listing/${item.id}`)}
      style={[styles.gridCard, Shadows.medium]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/onboarding-hero.png")
          }
          style={styles.gridImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.gridHeartButton}>
          <Ionicons name="heart-outline" size={16} color={Colors.text} />
        </View>
      </View>

      <View style={styles.gridContent}>
        <View style={styles.topMetaRow}>
          <View style={styles.yearCapsule}>
            <Text style={styles.yearCapsuleText}>{item.year}</Text>
          </View>
          {item.isFeatured ? (
            <View style={styles.featureTag}>
              <Text style={styles.featureTagText}>Unggulan</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.brand} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.variant} numberOfLines={1}>
          {variantName || item.carModel?.modelName}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoText}>{conditionLabel}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoText}>{item.fuelType}</Text>
          </View>
        </View>

        <Text style={styles.price}>{formatRupiah(item.price)}</Text>

        <View style={styles.bottomMetaRow}>
          <View style={styles.ratingRow}>
            <Ionicons
              name="speedometer-outline"
              size={12}
              color={Colors.textTertiary}
            />
            <Text style={styles.locationText}>
              {formatMileage(item.mileage)}
            </Text>
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.locationCity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: CARD_WIDTH * 0.78,
    backgroundColor: Colors.inputFill,
  },
  gridHeartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridContent: {
    padding: 14,
  },
  horizontalCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalImage: {
    width: 132,
    height: 146,
    backgroundColor: Colors.inputFill,
  },
  horizontalContent: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  topMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  yearCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  yearCapsuleText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
  },
  heartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.text,
  },
  brand: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  variant: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  infoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  infoText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  price: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.6,
  },
  bottomMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textTertiary,
  },
});
