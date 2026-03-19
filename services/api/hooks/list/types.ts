export interface ListMoviesParams {
  type_list: 'hoat-hinh' | 'tv-shows' | 'phim-bo' | 'phim-le';
  page?: number;
  sort_field?: string;
  sort_type?: 'asc' | 'desc';
  sort_lang?: string;
  category?: string;
  country?: string;
  year?: number;
  limit?: number;
}

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

export interface CountryDetail {
  id: string;
  name: string;
  slug: string;
}

export interface ListMovieItem {
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
  country: CountryDetail[];
}

export interface SeoOnPage {
  og_type: string;
  titleHead: string;
  descriptionHead: string;
  og_image: string[];
  og_url: string;
}

export interface BreadCrumb {
  name: string;
  slug?: string;
  isCurrent: boolean;
  position: number;
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface Params {
  type_slug: string;
  slug: string;
  filterCategory?: string[];
  filterCountry?: string[];
  filterYear?: string[];
  filterType?: string[];
  sortField: string;
  sortType: string;
  pagination: Pagination;
}

export interface ListMoviesData {
  seoOnPage: SeoOnPage;
  breadCrumb: BreadCrumb[];
  titlePage: string;
  items: ListMovieItem[];
  params: Params;
  type_list: string;
  APP_DOMAIN_FRONTEND: string;
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface GetListMoviesResponse {
  status: boolean;
  msg: string;
  data: ListMoviesData;
}
