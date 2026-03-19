import { CountryMoviesPage } from '@/pages/CountryMoviesPage';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CountryMoviesScreen() {
  const { slug, title } = useLocalSearchParams<{
    slug: string;
    title: string;
  }>();

  return <CountryMoviesPage countrySlug={slug || ''} title={title || 'Phim'} />;
}
