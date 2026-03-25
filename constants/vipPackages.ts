import { VIPPlan } from '@/store/slices/PaymentSlice/paymentSlice';

export interface VIPPackage {
  id: string;
  plan: VIPPlan;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  durationLabel: string;
  features: string[];
  color: string;
  popular?: boolean;
}

export const VIP_PACKAGES: VIPPackage[] = [
  {
    id: 'free',
    plan: 'free',
    name: 'Free',
    description: 'Miễn phí',
    price: 0,
    durationDays: 0,
    durationLabel: 'Vĩnh viễn',
    features: [
      'Xem phim chất lượng SD',
      'Giới hạn 1 thiết bị',
      'Xem có quảng cáo',
    ],
    color: '#909090',
  },
  {
    id: 'premium',
    plan: 'premium',
    name: 'Premium',
    description: 'Cao cấp toàn diện',
    price: 149000,
    durationDays: 30,
    durationLabel: '1 tháng',
    features: [
      'Xem phim 4K Dolby Vision',
      'Giới hạn 6 thiết bị cùng lúc',
      'Không quảng cáo toàn nền tảng',
      'Tải offline không giới hạn',
      'Xem sớm phim mới trước 72 giờ',
      'Truy cập nội dung độc quyền Premium',
      'Âm thanh vòm Dolby Atmos',
      'Hỗ trợ ưu tiên 24/7',
      'Quà tặng 2 voucher mỗi tháng',
    ],
    color: '#FF7A00',
    popular: true,
  },
];

export const getVIPPackageByPlan = (plan: VIPPlan): VIPPackage | undefined => {
  if (plan === 'free') {
    return VIP_PACKAGES.find((pkg) => pkg.plan === 'free');
  }

  return VIP_PACKAGES.find((pkg) => pkg.plan === 'premium');
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
};
