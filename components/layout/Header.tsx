import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HeaderProps {
  title: string;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  showSearchIcon?: boolean;
  showMenuIcon?: boolean;
  showBackIcon?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSearchPress,
  onMenuPress,
  showSearchIcon = true,
  showMenuIcon = false,
  showBackIcon = false,
  onBackPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
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
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={styles.rightSection}>
        {showSearchIcon && (
          <Pressable onPress={onSearchPress}>
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
