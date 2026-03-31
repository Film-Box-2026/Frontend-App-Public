import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colors = Colors['dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8F949B',
        tabBarStyle: {
          backgroundColor: '#111317',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 74,
          paddingTop: 4,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          tabBarLabel: 'Search',
        }}
      />

      <Tabs.Screen
        name="my-list"
        options={{
          title: 'Watch Short',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="play-circle-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Watch Short',
        }}
      />

      <Tabs.Screen
        name="vip"
        options={{
          title: 'Subscription',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="diamond-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Subscription',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />

      <Tabs.Screen
        name="series"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="tvshows"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="cartoon"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="cinema"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

