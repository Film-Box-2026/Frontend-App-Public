export interface TMDB {
  type: string | null;
  id: string | null;
  season: number | null;
  vote_average: number;
  vote_count: number;
}

export interface IMDB {
  id: string | null;
}

export interface CreatedModified {
  time: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface YearMovieItem {
  tmdb: TMDB;
  imdb: IMDB;
  created: CreatedModified;
  modified: CreatedModified;
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: string;
  poster_url: string;
  thumb_url: string;
  sub_docquyen: boolean;
  chieurap: boolean;
  time: string;
  episode_current: string;
  quality: string;
  lang: string;
  year: number;
  category: CategoryItem[];
}

export interface GetYearMoviesParams {
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
  category?: string;
  country?: string;
}

export type YearMoviesData = YearMovieItem[];

export interface GetYearMoviesResponse {
  status: boolean;
  msg: string;
  data: YearMoviesData;
}
