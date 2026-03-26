import { MyListPage } from '@/pages/MyListPage';
import { useAppSelector } from '@/store/hooks';
import { Redirect } from 'expo-router';

export default function MyListTabScreen() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <MyListPage />;
}
