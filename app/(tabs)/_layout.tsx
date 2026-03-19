import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#2e2d2dff',
        },
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
          marginBottom: -50,
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
        name="series"
        options={{
          title: 'Series',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
          tabBarLabel: 'Series',
        }}
      />

      <Tabs.Screen
        name="tvshows"
        options={{
          title: 'TV Shows',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="tv" size={size} color={color} />
          ),
          tabBarLabel: 'TV Shows',
        }}
      />

      <Tabs.Screen
        name="cartoon"
        options={{
          title: 'Cartoon',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="color-palette" size={size} color={color} />
          ),
          tabBarLabel: 'Cartoon',
        }}
      />

      <Tabs.Screen
        name="cinema"
        options={{
          title: 'Cinema',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="film" size={size} color={color} />
          ),
          tabBarLabel: 'Cinema',
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
    </Tabs>
  );
}

