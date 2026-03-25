import { PaymentPage } from '@/pages';
import { useAppSelector } from '@/store/hooks';
import { Redirect } from 'expo-router';

export default function VipTabScreen() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <PaymentPage />;
}