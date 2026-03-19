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

export interface CountryMovieItem {
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

export interface CountryMoviesData {
  seoOnPage: SeoOnPage;
  breadCrumb: BreadCrumb[];
  titlePage: string;
  items: CountryMovieItem[];
  params: Params;
  type_list: string;
  APP_DOMAIN_FRONTEND: string;
  APP_DOMAIN_CDN_IMAGE: string;
}

export interface GetCountryMoviesResponse {
  status: string;
  msg: string;
  data: CountryMoviesData;
}

export interface GetCountryMoviesParams {
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_type?: string;
  category?: string;
  year?: string;
}
