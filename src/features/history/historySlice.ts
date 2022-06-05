import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { HistoryItem } from "./types"

export const historySlice = createSlice({
  name: "history",
  initialState: [] as HistoryItem[],
  reducers: {
    push: (state, action: PayloadAction<HistoryItem>) => {
      state.push(action.payload)
    },
    slice: (state, action: PayloadAction<number>) => {
      return state.slice(0, action.payload + 1)
    },
    clearHistory: () => [],
  }
})

export const { push, slice, clearHistory } = historySlice.actions

export const traverseInTime = createAction<HistoryItem>("history/traverse")

export const selectHistory = (state: RootState) => [ ...state.history.slice(1, state.history.length) ]

export default historySlice.reducer
