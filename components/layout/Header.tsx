import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface HeaderProps {
  title?: string;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  showSearchIcon?: boolean;
  showMenuIcon?: boolean;
  showBackIcon?: boolean;
  onBackPress?: () => void;
  variant?: 'solid' | 'overlay';
  showLogo?: boolean;
  navItems?: string[];
  activeNavIndex?: number;
  onNavItemPress?: (index: number) => void;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = '',
  onSearchPress,
  onMenuPress,
  showSearchIcon = false,
  showMenuIcon = false,
  showBackIcon = false,
  onBackPress,
  variant = 'solid',
  showLogo = false,
  navItems,
  activeNavIndex = -1,
  onNavItemPress,
  rightContent,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isOverlay = variant === 'overlay';
  const handleSearchPress = onSearchPress || (() => router.push('/search'));

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 19,
      paddingVertical: isOverlay ? 8 : 12,
      backgroundColor: isOverlay
        ? 'rgba(7, 8, 12, 0.66)'
        : colorScheme === 'dark'
          ? colors.headerBackground
          : colors.headerBackground,
      borderBottomWidth: isOverlay ? 0 : 1,
      borderBottomColor: colors.headerBorder,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    logoWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF2F43',
    },
    navItemsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 19,
      paddingLeft: 4,
      paddingRight: 20, // Thêm padding cuối để kéo đến item cuối có khoảng thở
    },
    navItemText: {
      fontSize: 19,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.72)',
    },
    navItemTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    titleText: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {showBackIcon && (
          <Pressable onPress={onBackPress}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
        )}

        {showLogo && (
          <View style={styles.logoWrap}>
            <Ionicons name="film" size={18} color="#FFFFFF" />
          </View>
        )}

        {navItems?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navItemsWrap}
            style={{ flex: 1 }}
          >
            {navItems.map((item, index) => (
              <Pressable key={`${item}-${index}`} onPress={() => onNavItemPress?.(index)}>
                <Text
                  style={[
                    styles.navItemText,
                    activeNavIndex === index && styles.navItemTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.titleText}>{title}</Text>
        )}
      </View>
      <View style={styles.rightSection}>
        {rightContent}

        {showSearchIcon && (
          <Pressable onPress={handleSearchPress}>
            <Ionicons name="search" size={28} color={colors.text} />
          </Pressable>
        )}

        {showMenuIcon && (
          <Pressable onPress={onMenuPress}>
            <Ionicons name="menu" size={28} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
};
