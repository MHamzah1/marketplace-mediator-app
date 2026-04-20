import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { Shadows } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  color: string;
  focused: boolean;
  indicatorColor: string;
}

function TabIcon({ name, color, focused, indicatorColor }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={24} color={color} />
      {focused && <View style={[styles.activeIndicator, { backgroundColor: indicatorColor }]} />}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          paddingTop: 10,
          paddingHorizontal: 8,
          ...Shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              focused={focused}
              indicatorColor={colors.text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Kalkulator',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'calculator' : 'calculator-outline'}
              color={color}
              focused={focused}
              indicatorColor={colors.text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inspection"
        options={{
          title: 'Inspeksi',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              color={color}
              focused={focused}
              indicatorColor={colors.text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              color={color}
              focused={focused}
              indicatorColor={colors.text}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 30,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 28,
    height: 3,
    borderRadius: 1.5,
  },
});
