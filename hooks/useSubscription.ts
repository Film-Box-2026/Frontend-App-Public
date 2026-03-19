import {
    DEFAULT_SUBSCRIPTION,
    UserSubscription,
} from '@/constants/subscriptionPlans';
import { subscriptionService } from '@/services/subscriptionService';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription>(
    DEFAULT_SUBSCRIPTION
  );
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    try {
      const data = await subscriptionService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await loadSubscription();
      setLoading(false);
    };

    initialize();
  }, [loadSubscription]);

  useFocusEffect(
    useCallback(() => {
      loadSubscription();
      return () => {};
    }, [loadSubscription])
  );

  return {
    subscription,
    setSubscription,
    reloadSubscription: loadSubscription,
    loading,
    canWatchVIP: subscriptionService.canWatchVIP(subscription),
    isActive: subscriptionService.isSubscriptionActive(subscription),
    remainingDays: subscriptionService.getRemainingDays(subscription),
  };
};
