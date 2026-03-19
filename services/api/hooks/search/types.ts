export interface SearchParams {
  keyword: string;
  page?: number;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
  category?: string;
  country?: string;
  year?: string;
  limit?: number;
}

export interface MovieItem {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year?: number;
  episode_current?: string;
  quality?: string;
  content?: string;
  category?: { _id: string; name: string }[];
  actor?: string[];
  director?: string[];
}

export interface SearchResponse {
  status: string;
  msg: string;
  data: {
    items: MovieItem[] | null;
    params: {
      keyword: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
  };
}
