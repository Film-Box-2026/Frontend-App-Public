import { saveResumePoints } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ResumePoint, setResumePoint } from '@/store/slices/ResumeSlice/resumeSlice';
import { useCallback, useEffect, useRef } from 'react';

interface UseResumeMovieProps {
  movieId: string;
  slug: string;
  episodeIndex: number;
  totalDuration: number;
}

const SAVE_INTERVAL = 5000; // Save every 5 seconds

export const useResumeMovie = ({
  movieId,
  slug,
  episodeIndex,
  totalDuration,
}: UseResumeMovieProps) => {
  const dispatch = useAppDispatch();
  const resumePoints = useAppSelector((state) => state.resume.points as { [key: string]: ResumePoint });
  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveResumePoint = useCallback(
    async (currentTime: number) => {
      const now = Date.now();

      // Only save if at least SAVE_INTERVAL ms has passed since last save
      if (now - lastSaveTimeRef.current < SAVE_INTERVAL) {
        return;
      }

      lastSaveTimeRef.current = now;

      const resumePoint: ResumePoint = {
        movieId,
        slug,
        episodeIndex,
        currentTime,
        totalDuration,
        updatedAt: new Date().toISOString(),
      };

      dispatch(setResumePoint(resumePoint));

      // Persist to AsyncStorage
      const updatedPoints = {
        ...(resumePoints || {}),
        [movieId]: resumePoint,
      };
      await saveResumePoints(updatedPoints);
    },
    [movieId, slug, episodeIndex, totalDuration, dispatch, resumePoints]
  );

  const getResumeData = useCallback(() => {
    const points = resumePoints as { [key: string]: ResumePoint };
    return points?.[movieId] || null;
  }, [movieId, resumePoints]);

  const clearResumePoint = useCallback(async () => {
    const updatedPoints = { ...(resumePoints || {}) };
    delete updatedPoints[movieId];
    await saveResumePoints(updatedPoints);
  }, [movieId, resumePoints]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveResumePoint,
    getResumeData,
    clearResumePoint,
  };
};
