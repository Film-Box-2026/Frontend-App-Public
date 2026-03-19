import { UserSubscription } from '@/constants/subscriptionPlans';
import { subscriptionService } from '@/services/subscriptionService';

export const useVIPAccessControl = (subscription: UserSubscription | null) => {
  return {
    canWatchVIP: subscriptionService.canWatchVIP(subscription),
    isActive: subscriptionService.isSubscriptionActive(subscription),
    remainingDays: subscriptionService.getRemainingDays(subscription),
    expiryDate: subscriptionService.formatExpiryDate(
      subscription?.expiredAt || null
    ),
  };
};
