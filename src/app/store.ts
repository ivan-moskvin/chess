import { Action, combineReducers, configureStore, ThunkAction } from "@reduxjs/toolkit"
import boardReducer from "../features/board/boardSlice"
import pieceReducer from "../features/piece/pieceSlice"
import gameReducer from "../features/game/gameSlice"
import historyReducer from "../features/history/historySlice"
import optionsReducer from "../features/options/optionsSlice"
import { persistReducer, } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { PERSIST_ROOT_NAME } from "./constants"

const persistConfig = {
  key: PERSIST_ROOT_NAME,
  version: 1,
  storage,
}

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    board: boardReducer,
    piece: pieceReducer,
    game: gameReducer,
    history: historyReducer,
    options: optionsReducer
  })
)

export const store = configureStore({
  reducer: persistedReducer,
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
