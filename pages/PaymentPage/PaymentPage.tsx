import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { formatPrice, VIP_PACKAGES, VIPPackage } from '@/constants/vipPackages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { vnpayService } from '@/services/api/vnpay';
import { saveSubscription } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addTransaction,
    setError,
    setLoading,
    setSubscription,
} from '@/store/slices/PaymentSlice/paymentSlice';

export const PaymentPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, subscription } = useAppSelector((state) => state.payment);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePayment = useCallback(
    async (plan: VIPPackage) => {
      if (plan.plan === 'free') {
        // Free plan - no payment needed
        const newSubscription = {
          status: 'active' as const,
          plan: 'free' as const,
          startDate: new Date().toISOString(),
          expiryDate: new Date().toISOString(),
          autoRenewal: false,
        };
        dispatch(setSubscription(newSubscription));
        await saveSubscription(newSubscription);
        Alert.alert('Thành công', 'Bạn đã chuyển sang gói Free');
        router.back();
        return;
      }

      dispatch(setLoading(true));
      try {
        // Call mock VNpay service
        const result = await vnpayService.mockPaymentFlow(
          plan.price,
          plan.plan
        );

        if (result.status === 'success') {
          // Calculate expiry date
          const startDate = new Date();
          const expiryDate = new Date(
            startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
          );

          const newSubscription = {
            status: 'active' as const,
            plan: plan.plan,
            startDate: startDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            autoRenewal: true,
          };

          // Update Redux
          dispatch(setSubscription(newSubscription));
          dispatch(
            addTransaction({
              id: result.transactionId,
              amount: result.amount,
              plan: result.plan as typeof plan.plan,
              status: 'success',
              createdAt: new Date().toISOString(),
            })
          );

          // Save to storage
          await saveSubscription(newSubscription);

          Alert.alert(
            'Thanh toán thành công!',
            `Bạn đã nâng cấp lên gói ${plan.name}\n\nHết hạn: ${expiryDate.toLocaleDateString('vi-VN')}`,
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        } else {
          dispatch(
            addTransaction({
              id: result.transactionId,
              amount: result.amount,
              plan: result.plan as typeof plan.plan,
              status: 'failed',
              createdAt: new Date().toISOString(),
            })
          );
          Alert.alert('Thanh toán thất bại', 'Vui lòng thử lại');
        }
      } catch (error) {
        console.error('Payment error:', error);
        dispatch(setError('Có lỗi khi thanh toán'));
        Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  const renderPackage = ({ item }: { item: VIPPackage }) => {
    const isSelected = selectedPlan === item.id;
    const isCurrentPlan = subscription?.plan === item.plan;

    return (
      <Pressable
        style={[
          styles.packageCard,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: isSelected ? item.color : 'transparent',
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => setSelectedPlan(item.id)}
      >
        {item.popular && (
          <LinearGradient
            colors={[item.color, `${item.color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.popularBadge}
          >
            <Text style={styles.popularText}>Phổ biến nhất</Text>
          </LinearGradient>
        )}

        <View style={styles.packageHeader}>
          <Text style={[styles.packageName, { color: item.color }]}>
            {item.name}
          </Text>
          {isCurrentPlan && (
            <View
              style={[
                styles.currentBadge,
                { backgroundColor: item.color },
              ]}
            >
              <Text style={styles.currentText}>Hiện tại</Text>
            </View>
          )}
        </View>

        {item.price > 0 && (
          <>
            <Text style={[styles.price, { color: item.color }]}>
              {formatPrice(item.price)}
            </Text>
            <Text
              style={[
                styles.duration,
                { color: colorScheme === 'dark' ? '#DADCE2' : colors.text },
              ]}
            >
              /{item.durationLabel}
            </Text>
          </>
        )}

        <View style={styles.featuresList}>
          {item.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={item.color}
                style={styles.featureIcon}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: colorScheme === 'dark' ? '#DABCE2' : colors.text },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.selectButton,
            {
              backgroundColor: isSelected ? item.color : 'transparent',
              borderColor: item.color,
              borderWidth: 1,
            },
          ]}
          disabled={loading || isCurrentPlan}
          onPress={() => handlePayment(item)}
        >
          {loading && isSelected ? (
            <ActivityIndicator size="small" color={isSelected ? '#FFF' : item.color} />
          ) : (
            <Text
              style={[
                styles.selectButtonText,
                { color: isSelected ? '#FFF' : item.color },
              ]}
            >
              {isCurrentPlan ? 'Hiện tại' : isSelected ? 'Thanh toán' : 'Chọn'}
            </Text>
          )}
        </Pressable>
      </Pressable>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0B0B0E' : colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
      marginLeft: 12,
      flex: 1,
    },
    subtitle: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#B8BBC6' : colors.tabIconDefault,
      fontWeight: '500',
    },
    scrollContent: {
      padding: 16,
      gap: 12,
      paddingBottom: 32,
    },
    packageCard: {
      borderRadius: 16,
      padding: 16,
      minHeight: 320,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    popularBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    popularText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFF',
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    packageName: {
      fontSize: 24,
      fontWeight: '700',
    },
    currentBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFF',
    },
    price: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 2,
    },
    duration: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
    },
    featuresList: {
      gap: 10,
      marginBottom: 16,
      flex: 1,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureIcon: {
      minWidth: 16,
    },
    featureText: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    selectButton: {
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colorScheme === 'dark' ? '#FFFFFF' : colors.text}
            />
          </Pressable>
          <Text style={styles.title}>Nâng cấp VIP</Text>
        </View>
        <Text style={styles.subtitle}>
          Chọn gói phù hợp để mở khóa các tính năng độc quyền
        </Text>
      </View>

      <FlatList
        data={VIP_PACKAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderPackage}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default PaymentPage;
