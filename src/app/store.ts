import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import boardReducer from '../features/board/boardSlice';
import pieceReducer from '../features/piece/pieceSlice';
import gameReducer from '../features/game/gameSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    piece: pieceReducer,
    game: gameReducer
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
