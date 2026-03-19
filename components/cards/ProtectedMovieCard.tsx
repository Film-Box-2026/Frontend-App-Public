import { MovieCard } from '@/components/cards';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ProtectedMovieCardProps {
  movie: any;
  isLocked: boolean;
  onPress: (movie: any) => void;
  onUpgradePress?: () => void;
  width?: number;
}


export const ProtectedMovieCard: React.FC<ProtectedMovieCardProps> = ({
  movie,
  isLocked,
  onPress,
  onUpgradePress,
  width,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { width }]}>
      <Pressable
        onPress={() => !isLocked && onPress(movie)}
        disabled={isLocked}
        style={[
          styles.cardWrapper,
          {
            opacity: isLocked ? 0.6 : 1,
          },
        ]}
      >
        <MovieCard movie={movie} onPress={() => {}} width={width} />

        {isLocked && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.lockOverlay}
          >
            <View style={styles.lockContent}>
              <Ionicons
                name="lock-closed"
                size={28}
                color="#FFF"
                style={styles.lockIcon}
              />
              <Text style={styles.lockText}>Nâng cấp để xem</Text>
              {onUpgradePress && (
                <Pressable
                  style={[
                    styles.upgradeButton,
                    { backgroundColor: '#3B82F6' },
                  ]}
                  onPress={onUpgradePress}
                >
                  <Text style={styles.upgradeButtonText}>Nâng cấp</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
  },
  lockContent: {
    alignItems: 'center',
    gap: 8,
  },
  lockIcon: {
    marginBottom: 4,
  },
  lockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  upgradeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 4,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
