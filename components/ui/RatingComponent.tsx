import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RatingComponentProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  showLabel?: boolean;
}

export const RatingComponent: React.FC<RatingComponentProps> = ({
  initialRating = 0,
  onRatingChange,
  size = 24,
  showLabel = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [rating, setRating] = useState(initialRating);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onRatingChange(newRating);
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 4,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => handleRatingChange(star)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? colors.tint : colors.tabIconDefault}
            />
          </Pressable>
        ))}
      </View>
      {showLabel && rating > 0 && (
        <Text style={styles.ratingText}>{rating}.0</Text>
      )}
    </View>
  );
};

export default RatingComponent;
