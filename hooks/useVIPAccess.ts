import { useAppSelector } from '@/store/hooks';
import { VIPPlan } from '@/store/slices/PaymentSlice/paymentSlice';

export interface MovieRequirement {
  requiresVIP: boolean;
  minPlan?: VIPPlan;
  reason?: string;
}

export const useVIPAccess = () => {
  const subscription = useAppSelector((state) => state.payment.subscription);

  const canWatchMovie = (movieRequirement: MovieRequirement): boolean => {
    if (!movieRequirement.requiresVIP) {
      return true;
    }

    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const planHierarchy: Record<VIPPlan, number> = {
      free: 0,
      basic: 1,
      premium: 2,
      vip: 3,
    };

    const minPlan = movieRequirement.minPlan || 'premium';
    return planHierarchy[subscription.plan] >= planHierarchy[minPlan];
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

    const expiryDate = new Date(subscription.expiryDate);
    const now = new Date();
    const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
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
