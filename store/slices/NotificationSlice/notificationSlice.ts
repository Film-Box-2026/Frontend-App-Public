import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  readIds: string[];
}

const initialState: NotificationState = {
  readIds: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setReadIds: (state, action: PayloadAction<string[]>) => {
      state.readIds = action.payload;
    },
    addReadId: (state, action: PayloadAction<string>) => {
      if (!state.readIds.includes(action.payload)) {
        state.readIds.push(action.payload);
      }
    },
    addReadIds: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((id) => {
        if (!state.readIds.includes(id)) {
          state.readIds.push(id);
        }
      });
    },
    clearReadIds: (state) => {
      state.readIds = [];
    },
  },
});

export const { setReadIds, addReadId, addReadIds, clearReadIds } =
  notificationSlice.actions;
export default notificationSlice.reducer;
