export interface IMDbInfo {
  id: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDbInfo {
  id: number;
  vote_average: number;
  vote_count: number;
}

export interface ModifiedInfo {
  time: string;
}

export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  slug: string;
  year: number;
  imdb: IMDbInfo;
  tmdb: TMDbInfo;
  modified: ModifiedInfo;
}

export interface Pagination {
  currentPage: number;
  totalItems: number;
  totalItemsPerPage: number;
  totalPages: number;
}

export interface GetNewMoviesResponse {
  items: Movie[];
  msg: string;
  pagination: Pagination;
  status: boolean;
}
