import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Board } from "../board/boardSlice"
import { Game } from "../game/gameSlice"
import { AppThunk, RootState } from "../../app/store"
import { IPiece, PiecePosition } from "../piece/pieceSlice"

export type HistoryItem = {
  name: string,
  board: Board,
  game: Game,
  piece: { current: IPiece }
}

export const getHistoryItemName = (position: PiecePosition, to: PiecePosition): string => {
  return `${position} \u21e8 ${to}`
}

const historySlice = createSlice({
  name: "history",
  initialState: [] as HistoryItem[],
  reducers: {
    push: (state, action: PayloadAction<HistoryItem>) => {
      state.push(action.payload)
    },
    slice: (state, action: PayloadAction<number>) => {
      return state.slice(0, action.payload + 1)
    }
  }
})

export const selectHistory = (state: RootState) => state.history

export const historySnapshot = (name: string): AppThunk => (dispatch, getState) => {
  dispatch(historySlice.actions.push({ ...getState(), name }))
}
export const traverseToMove = (to: string): AppThunk => (dispatch, getState) => {
  let index = 0
  const { history } = getState()
  const snapshot = history.find(({ name }, i) => {
    if (name === to) {
      index = i
      return true
    }

    return false
  })

  if (index === history.length - 1) return
  if (!snapshot) return

  // Slice history
  dispatch(historySlice.actions.slice(index))

  dispatch(traverseInTime(snapshot))
}

export const traverseInTime = createAction<HistoryItem>("history/traverse")

export default historySlice.reducer
