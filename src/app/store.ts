import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import fieldReducer from '../features/board/boardSlice';

export const store = configureStore({
  reducer: {
    field: fieldReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
