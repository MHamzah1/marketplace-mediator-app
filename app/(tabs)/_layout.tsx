import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import Colors, { Shadows } from '@/constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  color: string;
  focused: boolean;
}

function TabIcon({ name, color, focused }: TabIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons name={name} size={24} color={color} />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          ...Shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'car-sport' : 'car-sport-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Kalkulator',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calculator' : 'calculator-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspection"
        options={{
          title: 'Inspeksi',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={focused} />
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
    height: 32,
  },
  iconContainerActive: {
    // active state handled by indicator
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
});
