import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    DEFAULT_SUBSCRIPTION,
    formatPrice,
    Plan,
    SUBSCRIPTION_PLANS,
    UserSubscription,
} from '@/constants/subscriptionPlans';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { subscriptionService } from '@/services/subscriptionService';

export const SubscriptionScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [subscription, setSubscription] = useState<UserSubscription>(
    DEFAULT_SUBSCRIPTION
  );
  const [loading, setLoading] = useState(false);

  const loadCurrentSubscription = useCallback(async () => {
    try {
      const currentSubscription = await subscriptionService.getSubscription();
      setSubscription(currentSubscription);
    } catch (error) {
      console.error('Load subscription error:', error);
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCurrentSubscription();
      return () => {};
    }, [loadCurrentSubscription])
  );

  const handleUpgradeToPremium = async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.upgradeToPremium();
      setSubscription(result);

      const expiryDate = new Date(result.expiredAt || 0).toLocaleDateString(
        'vi-VN'
      );
      Alert.alert(
        'Nâng cấp thành công!',
        `Bạn đã nâng cấp lên gói Premium\n\nHết hạn: ${expiryDate}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert('Lỗi', 'Không thể nâng cấp, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleDowngradeToFree = async () => {
    Alert.alert(
      'Hạ cấp xuống Miễn Phí?',
      'Bạn sẽ mất quyền xem VIP và những tính năng khác',
      [
        { text: 'Hủy', onPress: () => {} },
        {
          text: 'Hạ cấp',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await subscriptionService.downgradeToFree();
              setSubscription(result);
              Alert.alert('Thành công', 'Bạn đã hạ cấp xuống gói Miễn Phí', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Downgrade error:', error);
              Alert.alert('Lỗi', 'Không thể hạ cấp, vui lòng thử lại');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderPlanCard = (plan: Plan) => {
    const isCurrentPlan = subscription.currentPlan === plan.id;

    return (
      <View key={plan.id} style={styles.planCardContainer}>
        {plan.id === 'premium' && (
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.highlightBadge}
          >
            <Text style={styles.highlightText}>Phổ biến nhất</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={
            plan.id === 'premium'
              ? ['#FF7A00', '#662F00']
              : colorScheme === 'dark'
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.planCard,
            {
              borderColor:
                plan.id === 'premium' ? '#FF7A00' : 'rgba(255,255,255,0.1)',
              backgroundColor: undefined,
            },
          ]}
        >
          <View style={styles.planHeader}>
            <View>
              <Text
                style={[
                  styles.planName,
                  { color: plan.id === 'premium' ? '#FF7A00' : colors.text },
                ]}
              >
                {plan.name}
              </Text>
              <Text
                style={[
                  styles.planPrice,
                  {
                    color:
                      plan.id === 'premium'
                        ? '#FFF'
                        : colors.tabIconDefault,
                  },
                ]}
              >
                {formatPrice(plan.price)}
              </Text>
              {plan.price > 0 && (
                <Text
                  style={[
                    styles.planDuration,
                    {
                      color:
                        plan.id === 'premium'
                          ? 'rgba(255,255,255,0.8)'
                          : colors.tabIconDefault,
                    },
                  ]}
                >
                  /{plan.durationLabel}
                </Text>
              )}
            </View>
            {isCurrentPlan && (
              <View
                style={[
                  styles.currentBadge,
                  {
                    backgroundColor:
                      plan.id === 'premium'
                        ? 'rgba(255,255,255,0.2)'
                        : colors.tint,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#FFF"
                />
              </View>
            )}
          </View>

          <View style={styles.featuresList}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={plan.id === 'premium' ? '#FF7A00' : colors.tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    {
                      color:
                        plan.id === 'premium'
                          ? 'rgba(255,255,255,0.9)'
                          : colors.text,
                    },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {isCurrentPlan && subscription.currentPlan === 'premium' && (
            <View
              style={[
                styles.expiryInfo,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                },
              ]}
            >
              <Ionicons name="calendar" size={16} color={colors.tint} />
              <Text style={[styles.expiryText, { color: colors.text }]}>
                Hết hạn:{' '}
                {new Date(
                  subscription.expiredAt || 0
                ).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  plan.id === 'premium' && isCurrentPlan
                    ? 'transparent'
                    : plan.id === 'premium'
                      ? '#FF7A00'
                      : colors.tint,
                borderColor: plan.id === 'premium' ? '#FF7A00' : 'transparent',
                borderWidth: plan.id === 'premium' && isCurrentPlan ? 1 : 0,
              },
            ]}
            onPress={() => {
              if (isCurrentPlan) {
                if (plan.id === 'premium') {
                  handleDowngradeToFree();
                }
              } else {
                if (plan.id === 'premium') {
                  handleUpgradeToPremium();
                }
              }
            }}
            disabled={loading || (isCurrentPlan && plan.id === 'free')}
          >
            {loading ? (
              <ActivityIndicator
                color={plan.id === 'premium' ? '#FFF' : colors.text}
              />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      plan.id === 'premium' && isCurrentPlan
                        ? '#FF7A00'
                        : '#FFF',
                  },
                ]}
              >
                {isCurrentPlan
                  ? plan.id === 'premium'
                    ? 'Gói hiện tại'
                    : 'Không thay đổi'
                  : 'Nâng cấp'}
              </Text>
            )}
          </Pressable>
        </LinearGradient>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 32,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.02)',
      borderBottomWidth: 1,
      borderBottomColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.08)',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.tabIconDefault,
      fontWeight: '500',
    },
    planCardContainer: {
      position: 'relative',
    },
    highlightBadge: {
      position: 'absolute',
      top: -12,
      right: 12,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
      zIndex: 10,
    },
    highlightText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFF',
    },
    planCard: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    planName: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '700',
    },
    planDuration: {
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    currentBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featuresList: {
      gap: 10,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureText: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
      flex: 1,
    },
    expiryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    expiryText: {
      fontSize: 12,
      fontWeight: '600',
    },
    actionButton: {
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký</Text>
        <Text style={styles.headerSubtitle}>
          Chọn gói phù hợp với bạn
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SUBSCRIPTION_PLANS.map(renderPlanCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;
