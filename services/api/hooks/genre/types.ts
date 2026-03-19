export interface Genre {
  _id: string;
  name: string;
  slug: string;
}

export interface GetGenresResponse {
  data: Genre[];
}

export interface GenreMoviesParams {
  type_list?: string;
  page?: number;
  sort_field?: string;
  sort_type?: 'asc' | 'desc';
  sort_lang?: string;
  country?: string;
  year?: number;
  limit?: number;
}
