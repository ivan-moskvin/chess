import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import boardReducer from "../features/board/boardSlice";
import pieceReducer from "../features/piece/pieceSlice";
import gameReducer from "../features/game/gameSlice";
import historyReducer from "../features/history/historySlice"
import optionsReducer from "../features/options/optionsSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer,
    piece: pieceReducer,
    game: gameReducer,
    history: historyReducer,
    options: optionsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>
