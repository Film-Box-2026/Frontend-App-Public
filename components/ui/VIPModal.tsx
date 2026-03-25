import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    ModalProps,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { getVIPPackageByPlan } from '@/constants/vipPackages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { VIPPlan } from '@/store/slices/PaymentSlice/paymentSlice';

interface VIPModalProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  minPlan?: VIPPlan;
  reason?: string;
  onUpgrade: () => void;
  onCancel: () => void;
}

export const VIPModal: React.FC<VIPModalProps> = ({
  visible,
  minPlan = 'premium',
  reason = 'Nội dung này chỉ dành cho các thành viên VIP',
  onUpgrade,
  onCancel,
  ...modalProps
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const vipPackage = getVIPPackageByPlan(minPlan);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
      backgroundColor: colorScheme === 'dark' ? '#1A1A1E' : colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#DADCE2' : colors.tabIconDefault,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    featuresList: {
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      gap: 12,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureText: {
      fontSize: 13,
      color: colorScheme === 'dark' ? '#DABCE2' : colors.text,
      fontWeight: '500',
      flex: 1,
    },
    buttonContainer: {
      gap: 12,
    },
    upgradeButton: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    upgradeButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF',
      textAlign: 'center',
    },
    cancelButton: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ECEDEE' : colors.text,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      {...modalProps}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="star"
                size={32}
                color="#FFD700"
              />
            </View>
            <Text style={styles.title}>Nâng cấp lên {vipPackage?.name}</Text>
            <Text style={styles.message}>{reason}</Text>
          </View>

          {vipPackage && vipPackage.features.length > 0 && (
            <View style={styles.featuresList}>
              {vipPackage.features.slice(0, 3).map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={vipPackage.color}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={[vipPackage?.color || '#FF9500', `${vipPackage?.color || '#FF9500'}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeButton}
            >
              <Pressable
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={onUpgrade}
              >
                <Text style={styles.upgradeButtonText}>
                  Nâng cấp ngay
                </Text>
              </Pressable>
            </LinearGradient>

            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Để sau</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
