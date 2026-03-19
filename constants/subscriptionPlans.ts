export type PlanId = 'free' | 'basic';

export const FREE_PLAN_MOVIE_LIMIT = 3;
export const MOVIE_LIMIT_CONFIG: Record<PlanId, number | null> = {
  'free': FREE_PLAN_MOVIE_LIMIT,
  'basic': null, // Unlimited
};

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  durationLabel: string;
  features: string[];
  color: string;
};

export type UserSubscription = {
  currentPlan: PlanId;
  expiredAt: number | null;
};

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Miễn Phí',
    price: 0,
    durationLabel: 'Mãi mãi',
    features: [
      'Xem phim thông thường (SD/HD)',
      'Có quảng cáo',
      'Không xem nội dung VIP',
      'Không tải xuống ngoại tuyến',
    ],
    color: '#6B7280',
  },
  {
    id: 'basic',
    name: 'Cơ Bản',
    price: 49000,
    durationLabel: 'tháng',
    features: [
      'Xem tất cả phim (bao gồm VIP)',
      'Không quảng cáo',
      'Full HD',
      'Tải xuống ngoại tuyến (tối đa 10)',
      '1 thiết bị cùng lúc',
    ],
    color: '#3B82F6',
  },
];

export const DEFAULT_SUBSCRIPTION: UserSubscription = {
  currentPlan: 'free',
  expiredAt: null,
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Miễn phí';
  return `${price.toLocaleString('vi-VN')} ₫`;
};

export const getPlanById = (id: PlanId): Plan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};
