import { DEFAULT_SUBSCRIPTION, UserSubscription } from '@/constants/subscriptionPlans';
import { getUserSubscription, saveUserSubscription } from '@/services/storage/storageService';

const MOCK_API_DELAY = 1500;

export const subscriptionService = {
  upgradeToBasic: async (): Promise<UserSubscription> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const expiredAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const newSubscription: UserSubscription = {
          currentPlan: 'basic',
          expiredAt,
        };
        await saveUserSubscription(newSubscription);
        resolve(newSubscription);
      }, MOCK_API_DELAY);
    });
  },

  downgradeToFree: async (): Promise<UserSubscription> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const newSubscription: UserSubscription = {
          currentPlan: 'free',
          expiredAt: null,
        };
        await saveUserSubscription(newSubscription);
        resolve(newSubscription);
      }, MOCK_API_DELAY);
    });
  },

  getSubscription: async (): Promise<UserSubscription> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const stored = await getUserSubscription();
          if (stored) {
            resolve(stored);
          } else {
            resolve(DEFAULT_SUBSCRIPTION);
          }
        } catch (error) {
          console.error('Error loading subscription:', error);
          resolve(DEFAULT_SUBSCRIPTION);
        }
      }, 300);
    });
  },

  canWatchVIP: (subscription: UserSubscription | null): boolean => {
    if (!subscription) return false;
    if (subscription.currentPlan === 'basic') {
      if (subscription.expiredAt && subscription.expiredAt < Date.now()) {
        return false;
      }
      return true;
    }
    return false;
  },

  isSubscriptionActive: (subscription: UserSubscription | null): boolean => {
    if (!subscription) return false;
    if (subscription.currentPlan === 'free') return true;
    if (subscription.expiredAt && subscription.expiredAt < Date.now()) return false;
    return true;
  },

  getRemainingDays: (subscription: UserSubscription | null): number => {
    if (!subscription || !subscription.expiredAt) return 0;
    const remainingTime = subscription.expiredAt - Date.now();
    return Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
  },

  formatExpiryDate: (expiredAt: number | null): string => {
    if (!expiredAt) return '';
    const date = new Date(expiredAt);
    return date.toLocaleDateString('vi-VN');
  },
};
