import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResumePoint {
  movieId: string;
  slug: string;
  serverIndex: number;
  episodeIndex: number;
  episodeSlug?: string;
  currentTime: number;
  totalDuration: number;
  updatedAt: string;
}

interface ResumeState {
  points: Map<string, ResumePoint> | { [key: string]: ResumePoint };
}

const initialState: ResumeState = {
  points: {},
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResumePoint: (state, action: PayloadAction<ResumePoint>) => {
      const points = state.points as { [key: string]: ResumePoint };
      points[action.payload.movieId] = action.payload;
    },
    removeResumePoint: (state, action: PayloadAction<string>) => {
      const points = state.points as { [key: string]: ResumePoint };
      delete points[action.payload];
    },
    setResumePoints: (state, action: PayloadAction<{ [key: string]: ResumePoint }>) => {
      state.points = action.payload;
    },
  },
});

export const { setResumePoint, removeResumePoint, setResumePoints } = resumeSlice.actions;
export default resumeSlice.reducer;
