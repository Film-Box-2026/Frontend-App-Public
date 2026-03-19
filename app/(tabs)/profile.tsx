import { ProfilePage } from '@/pages/ProfilePage';
import { useAppSelector } from '@/store/hooks';
import { Redirect } from 'expo-router';

export default function ProfileScreen() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <ProfilePage />;
}
