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
    id: 'basic',
    plan: 'basic',
    name: 'Basic',
    description: 'Cơ bản',
    price: 49000,
    durationDays: 30,
    durationLabel: '1 tháng',
    features: [
      'Xem phim chất lượng HD',
      'Giới hạn 2 thiết bị',
      'Xem không có quảng cáo',
      'Tải phim để xem offline',
    ],
    color: '#4A90E2',
  },
  {
    id: 'premium',
    plan: 'premium',
    name: 'Premium',
    description: 'Cao cấp',
    price: 99000,
    durationDays: 30,
    durationLabel: '1 tháng',
    features: [
      'Xem phim chất lượng 4K',
      'Giới hạn 4 thiết bị',
      'Xem không có quảng cáo',
      'Tải phim để xem offline',
      'Xem sơ khai phim mới',
      'Hỗ trợ ưu tiên 24/7',
    ],
    color: '#FF9500',
    popular: true,
  },
  {
    id: 'vip',
    plan: 'vip',
    name: 'VIP',
    description: 'Tất cả các tính năng',
    price: 199000,
    durationDays: 30,
    durationLabel: '1 tháng',
    features: [
      'Xem phim chất lượng 4K',
      'Giới hạn 6 thiết bị',
      'Xem không có quảng cáo',
      'Tải phim để xem offline',
      'Xem sơ khai phim mới (3 ngày trước)',
      'Hỗ trợ ưu tiên 24/7',
      'Truy cập nội dung độc quyền',
      'Nhận thêm 2 Voucher mỗi tháng',
    ],
    color: '#FF2D55',
  },
];

export const getVIPPackageByPlan = (plan: VIPPlan): VIPPackage | undefined => {
  return VIP_PACKAGES.find((pkg) => pkg.plan === plan);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
};
