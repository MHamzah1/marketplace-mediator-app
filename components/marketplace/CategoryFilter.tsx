import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors, { Shadows } from '@/constants/Colors';

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: 'apps' as const, color: Colors.categoryAll },
  { id: 'suv', label: 'SUV', icon: 'car-sport' as const, color: Colors.categorySUV },
  { id: 'sedan', label: 'Sedan', icon: 'car' as const, color: Colors.categorySedan },
  { id: 'hatchback', label: 'Hatch', icon: 'car-sport-outline' as const, color: Colors.categoryHatchback },
  { id: 'mpv', label: 'MPV', icon: 'bus' as const, color: Colors.categoryMPV },
  { id: 'pickup', label: 'Pickup', icon: 'cube' as const, color: Colors.categoryPickup },
  { id: 'sport', label: 'Sport', icon: 'speedometer' as const, color: Colors.categorySport },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (categoryId: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              isActive && { backgroundColor: cat.color },
              isActive && Shadows.blue,
            ]}
          >
            <View
              style={[
                styles.iconBg,
                {
                  backgroundColor: isActive
                    ? 'rgba(255,255,255,0.25)'
                    : cat.color + '15',
                },
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={isActive ? Colors.white : cat.color}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? Colors.white : Colors.textSecondary },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.white,
    gap: 8,
    ...Shadows.small,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
