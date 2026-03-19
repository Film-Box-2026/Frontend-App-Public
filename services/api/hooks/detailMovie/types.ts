export interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: Episode[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface TMDB {
  type: string;
  id: string;
  season?: number;
  vote_average: number;
  vote_count: number;
}

export interface IMDB {
  id: string | null;
}

export interface CreatedModified {
  time: string;
}

export interface DetailMovie {
  tmdb: TMDB;
  imdb: IMDB;
  created: CreatedModified;
  modified: CreatedModified;
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  poster_url: string;
  thumb_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: Category[];
  country: Country[];
}

export interface DetailMovieResponse {
  status: boolean;
  msg: string;
  movie: DetailMovie;
  episodes: EpisodeServer[];
}
