import { WatchShortPage } from '@/pages/WatchShortPage';
import { useAppSelector } from '@/store/hooks';
import { Redirect } from 'expo-router';

export default function WatchShortTabScreen() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <WatchShortPage />;
}
