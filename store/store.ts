import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/Auth/authSlice';
import cartoonReducer from './slices/CartoonPage/cartoonSlice';
import cinemaReducer from './slices/CinemaPage/cinemaSlice';
import historyReducer from './slices/HistorySlice/historySlice';
import homeReducer from './slices/HomePage/homeSlice';
import ratingReducer from './slices/RatingSlice/ratingSlice';
import resumeReducer from './slices/ResumeSlice/resumeSlice';
import seriesReducer from './slices/SeriresSlice/seriesSlice';
import themeReducer from './slices/themeSlice';
import tvshowsReducer from './slices/TVShowsPage/tvshowsSlice';
import watchlistReducer from './slices/WatchlistSlice/watchlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    home: homeReducer,
    cartoon: cartoonReducer,
    cinema: cinemaReducer,
    series: seriesReducer,
    tvshows: tvshowsReducer,
    watchlist: watchlistReducer,
    history: historyReducer,
    rating: ratingReducer,
    resume: resumeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
