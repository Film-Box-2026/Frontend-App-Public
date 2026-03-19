import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { getVIPPackageByPlan } from '@/constants/vipPackages';
import { VIPPlan } from '@/store/slices/PaymentSlice/paymentSlice';

interface VIPBadgeProps {
  minPlan?: VIPPlan;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const VIPBadge: React.FC<VIPBadgeProps> = ({
  minPlan = 'premium',
  size = 'small',
  style,
}) => {
  const vipPackage = getVIPPackageByPlan(minPlan);

  if (!vipPackage || minPlan === 'free') {
    return null;
  }

  const sizeConfig = {
    small: {
      height: 20,
      paddingHorizontal: 6,
      fontSize: 10,
      padding: 2,
    },
    medium: {
      height: 28,
      paddingHorizontal: 10,
      fontSize: 12,
      padding: 4,
    },
    large: {
      height: 36,
      paddingHorizontal: 12,
      fontSize: 14,
      padding: 6,
    },
  };

  const config = sizeConfig[size];

  const styles = StyleSheet.create({
    badge: {
      height: config.height,
      paddingHorizontal: config.paddingHorizontal,
      borderRadius: config.height / 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      overflow: 'hidden',
    },
    badgeText: {
      fontSize: config.fontSize,
      fontWeight: '700',
      color: '#FFF',
    },
  });

  return (
    <LinearGradient
      colors={[vipPackage.color, `${vipPackage.color}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, style]}
    >
      <Ionicons
        name="star"
        size={config.fontSize}
        color="#FFF"
      />
      <Text style={styles.badgeText}>{vipPackage.name}</Text>
    </LinearGradient>
  );
};
