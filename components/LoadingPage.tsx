import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ message }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    spinnerContainer: {
      alignItems: 'center',
      gap: 16,
    },
  });

  return (
    <SafeAreaView
      style={styles.safeContainer}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          {message && (
            <Text style={{ color: colors.text, fontSize: 16 }}>{message}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
