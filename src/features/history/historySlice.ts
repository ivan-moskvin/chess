import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk, RootState } from "../../app/store"
import { HistoryItem } from "./types"

const historySlice = createSlice({
  name: "history",
  initialState: [] as HistoryItem[],
  reducers: {
    push: (state, action: PayloadAction<HistoryItem>) => {
      state.push(action.payload)
    },
    slice: (state, action: PayloadAction<number>) => {
      return state.slice(0, action.payload + 1)
    },
    clear: () => [],
  }
})


export const historySnapshot = (name: string): AppThunk => (dispatch, getState) => {
  if (name === "init" && getState().history.length === 1) return

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

  if (index === history.length) return
  if (!snapshot) return

  // Slice history
  dispatch(historySlice.actions.slice(index))

  dispatch(traverseInTime(snapshot))
}

/**
 * Traverses 1 turn in past
 */
export const back = (): AppThunk => (dispatch, getState) => {
  const history = getState().history

  // If it's the first move after init
  if (history.length === 2) {
    return dispatch(traverseToMove("init"))
  }

  // Traverse to previous move
  const prevMoveName = history[history.length - 2].name

  return dispatch(traverseToMove(prevMoveName))
}

export const traverseInTime = createAction<HistoryItem>("history/traverse")

export const selectHistory = (state: RootState) => [ ...state.history.slice(1, state.history.length) ]

export default historySlice.reducer
