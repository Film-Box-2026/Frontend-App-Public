export interface AIRewriteResult {
  rewrittenQuery: string;
  confidence: number;
}

export interface AISuggestionResult {
  suggestions: string[];
}

export interface AISemanticIntentResult {
  semanticQuery: string;
  explanation?: string;
  relatedQueries?: string[];
}

export interface AISearchSignalResult {
  intentSummary: string;
  semanticQuery: string;
  mustHave: string[];
  tones: string[];
  exclusions: string[];
  queryCandidates: string[];
  genreHints: string[];
  countryHints: string[];
  yearHint?: string;
}

export interface AIRerankMovieInput {
  slug: string;
  name: string;
  origin_name?: string;
  year?: number;
  quality?: string;
  episode_current?: string;
}

export interface AIRerankResult {
  orderedSlugs: string[];
}

export interface AIUserSignalPayload {
  watchlist: string[];
  history: string[];
  ratings: { movieId: string; rating: number }[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatReply {
  answer: string;
  followUps: string[];
}
