import { useMutation, useQuery } from '@tanstack/react-query';
import {
    AIChatMessage,
    AIChatReply,
    AIRerankMovieInput,
    AIRerankResult,
    AIRewriteResult,
    AISemanticIntentResult,
    AISuggestionResult,
    AIUserSignalPayload,
} from './types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.1-8b-instant';

type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const normalizeSuggestion = (item: unknown): string => {
  if (typeof item === 'string') {
    return item.trim();
  }

  if (item && typeof item === 'object') {
    const candidate = item as {
      title?: unknown;
      type?: unknown;
      year?: unknown;
      country?: unknown;
      query?: unknown;
      text?: unknown;
    };

    const title =
      typeof candidate.title === 'string'
        ? candidate.title.trim()
        : typeof candidate.query === 'string'
          ? candidate.query.trim()
          : typeof candidate.text === 'string'
            ? candidate.text.trim()
            : '';

    const tags = [candidate.type, candidate.year, candidate.country]
      .filter((value) => typeof value === 'string' || typeof value === 'number')
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (title && tags.length > 0) {
      return `${title} ${tags.join(' ')}`.trim();
    }

    return title;
  }

  return '';
};

const extractFirstJson = (text: string): string => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    return '{}';
  }

  return text.slice(start, end + 1);
};

const requestGroqJson = async <T>(messages: GroqMessage[], fallback: T): Promise<T> => {
  if (!GROQ_API_KEY) {
    return fallback;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages,
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      return fallback;
    }

    const parsed = JSON.parse(extractFirstJson(content));
    return parsed as T;
  } catch {
    return fallback;
  }
};

export const useAIRewriteQuery = (
  query: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['ai-rewrite-query', query],
    enabled: query.trim().length > 1 && options?.enabled !== false,
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<AIRewriteResult> => {
      const fallback: AIRewriteResult = {
        rewrittenQuery: query,
        confidence: 0,
      };

      const result = await requestGroqJson<AIRewriteResult>(
        [
          {
            role: 'system',
            content:
              'Ban la tro ly tim kiem phim. Hay viet lai query gon, ro, giu nguyen y nguoi dung. Tra ve JSON: {"rewrittenQuery":"...","confidence":0-1}.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        fallback
      );

      if (!result.rewrittenQuery) {
        return fallback;
      }

      return {
        rewrittenQuery: result.rewrittenQuery,
        confidence: Number(result.confidence || 0),
      };
    },
  });
};

export const useAISearchSuggestions = (
  query: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['ai-search-suggestions', query],
    enabled: query.trim().length > 1 && options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<AISuggestionResult> => {
      const fallback: AISuggestionResult = { suggestions: [] };

      const result = await requestGroqJson<AISuggestionResult>(
        [
          {
            role: 'system',
            content:
              'Tao 6 goi y tim kiem phim bang tieng Viet tu input. Ngan gon, de click, da dang theo the loai, nam, quoc gia neu hop ly. Tra ve JSON: {"suggestions":["..."]}.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        fallback
      );

      return {
        suggestions: Array.isArray(result.suggestions)
          ? result.suggestions
              .map((item) => normalizeSuggestion(item))
              .filter(Boolean)
              .slice(0, 6)
          : [],
      };
    },
  });
};

export const useAISemanticIntent = (
  query: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['ai-semantic-intent', query],
    enabled: query.trim().length > 2 && options?.enabled !== false,
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<AISemanticIntentResult> => {
      const fallback: AISemanticIntentResult = {
        semanticQuery: query,
        explanation: '',
        relatedQueries: [],
      };

      const result = await requestGroqJson<AISemanticIntentResult>(
        [
          {
            role: 'system',
            content:
              'Phan tich y dinh tim phim cua nguoi dung. Tra ve JSON: {"semanticQuery":"cau tim kiem toi uu cho cong cu search","explanation":"giai thich 1 cau ngan","relatedQueries":["query lien quan 1","query lien quan 2"]}. relatedQueries toi da 2 phan tu, ngan gon, tap trung phim co kha nang ton tai trong kho API.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        fallback
      );

      return {
        semanticQuery: result.semanticQuery || query,
        explanation: result.explanation || '',
        relatedQueries: Array.isArray(result.relatedQueries)
          ? result.relatedQueries
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 2)
          : [],
      };
    },
  });
};

interface AIRerankPayload {
  query: string;
  movies: AIRerankMovieInput[];
  userSignals: AIUserSignalPayload;
}

export const useAIRerankMovies = (
  payload: AIRerankPayload,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['ai-rerank-movies', payload.query, payload.movies, payload.userSignals],
    enabled:
      payload.query.trim().length > 0 &&
      payload.movies.length > 1 &&
      options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<AIRerankResult> => {
      const fallback: AIRerankResult = {
        orderedSlugs: payload.movies.map((movie) => movie.slug),
      };

      const reducedMovies = payload.movies.slice(0, 24).map((item) => ({
        slug: item.slug,
        name: item.name,
        origin_name: item.origin_name,
        year: item.year,
        quality: item.quality,
      }));

      const result = await requestGroqJson<AIRerankResult>(
        [
          {
            role: 'system',
            content:
              'Sap xep danh sach phim theo do phu hop voi query va so thich user. Tra ve duy nhat JSON: {"orderedSlugs":["slug-1","slug-2",...]}',
          },
          {
            role: 'user',
            content: JSON.stringify({
              query: payload.query,
              movies: reducedMovies,
              userSignals: payload.userSignals,
            }),
          },
        ],
        fallback
      );

      const allowed = new Set(reducedMovies.map((item) => item.slug));
      const orderedSlugs = Array.isArray(result.orderedSlugs)
        ? result.orderedSlugs.filter((slug) => allowed.has(slug))
        : [];

      if (orderedSlugs.length === 0) {
        return fallback;
      }

      return { orderedSlugs };
    },
  });
};

interface AIChatPayload {
  message: string;
  history: AIChatMessage[];
  context: {
    query: string;
    movies: Array<{ name: string; slug: string }>;
  };
}

export const useAIChatFollowUp = () => {
  return useMutation({
    mutationFn: async (payload: AIChatPayload): Promise<AIChatReply> => {
      const fallback: AIChatReply = {
        answer: 'Toi chua the tra loi luc nay. Ban thu lai sau nhe.',
        followUps: [],
      };

      const historyText = payload.history
        .slice(-6)
        .map((item) => `${item.role}: ${item.content}`)
        .join('\n');

      const result = await requestGroqJson<AIChatReply>(
        [
          {
            role: 'system',
            content:
              'Ban la tro ly phim trong app mobile. Tra loi gon, de hieu, tap trung de xuat phim theo context tim kiem. Tra ve JSON: {"answer":"...","followUps":["...","..."]}.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              context: payload.context,
              history: historyText,
              question: payload.message,
            }),
          },
        ],
        fallback
      );

      return {
        answer: result.answer || fallback.answer,
        followUps: Array.isArray(result.followUps)
          ? result.followUps.slice(0, 3)
          : [],
      };
    },
  });
};
