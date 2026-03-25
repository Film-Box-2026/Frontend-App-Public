import { useAppSelector } from '@/store/hooks';
import { VIPPlan } from '@/store/slices/PaymentSlice/paymentSlice';

export interface MovieRequirement {
  requiresVIP: boolean;
  minPlan?: VIPPlan;
  reason?: string;
}

export const useVIPAccess = () => {
  const subscription = useAppSelector((state) => state.payment.subscription);

  const normalizeRequiredPlan = (plan?: VIPPlan): 'free' | 'premium' => {
    if (!plan || plan === 'free') {
      return 'free';
    }

    return 'premium';
  };

  const canWatchMovie = (movieRequirement: MovieRequirement): boolean => {
    if (!movieRequirement.requiresVIP) {
      return true;
    }

    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    if (subscription.plan !== 'free') {
      const expiryDate = new Date(subscription.expiryDate);
      if (Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
        return false;
      }
    }

    const requiredPlan = normalizeRequiredPlan(movieRequirement.minPlan || 'premium');
    if (requiredPlan === 'free') {
      return true;
    }

    return subscription.plan !== 'free';
  };

  const isVIPActive = (): boolean => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.plan === 'free') return false;

    const expiryDate = new Date(subscription.expiryDate);
    return expiryDate > new Date();
  };

  const getRemainingDays = (): number => {
    if (!subscription || subscription.status !== 'active') {
      return 0;
    }

    if (subscription.plan === 'free') {
      return 0;
    }

    const expiryDate = new Date(subscription.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    if (Number.isNaN(diffTime) || diffTime <= 0) {
      return 0;
    }
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getCurrentPlan = () => subscription?.plan;

  return {
    canWatchMovie,
    isVIPActive,
    getRemainingDays,
    getCurrentPlan,
    subscription,
  };
};
