import { YearMoviesPage } from '@/pages/YearMoviesPage';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function YearMoviesScreen() {
  const { year, title } = useLocalSearchParams<{
    year: string;
    title: string;
  }>();

  if (!year || !title) {
    return null;
  }

  return <YearMoviesPage year={year} title={title} />;
}
