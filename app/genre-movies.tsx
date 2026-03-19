import { GenreMoviesPage } from '@/pages/GenreMoviesPage';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function GenreMoviesScreen() {
  const { slug, title } = useLocalSearchParams<{
    slug: string;
    title: string;
  }>();

  if (!slug || !title) {
    return null;
  }

  return <GenreMoviesPage genreSlug={slug} title={title} />;
}
