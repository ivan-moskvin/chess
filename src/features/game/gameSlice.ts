import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { movePieceFromTo, PieceColor } from "../piece/pieceSlice"
import { RootState } from "../../app/store"

interface GameState {
  turn: PieceColor,
  checkTo: PieceColor | null,
  mateTo: PieceColor | null,
}

const gameSlice = createSlice({
  name: "game",
  initialState: {
    turn: PieceColor.WHITE,
    checkTo: null,
    mateTo: null
  } as GameState,
  reducers: {
    checkTo: (state, action: PayloadAction<PieceColor>) => {
      state.checkTo = action.payload
    },
    mateTo: (state, action: PayloadAction<PieceColor>) => {
      state.checkTo = null
      state.mateTo = action.payload
    },
    clearCheck: (state) => {
      state.checkTo = null
    }
  },
  extraReducers: builder => {
    // Toggle turn when move is done
    builder.addCase(movePieceFromTo, (state) => {
      state.turn = state.turn === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK
    })
  }
})

export const { checkTo, mateTo, clearCheck } = gameSlice.actions

export const selectTurn = (state: RootState) => state.game.turn
export const selectCheck = (state: RootState) => state.game.checkTo
export const selectMate = (state: RootState) => state.game.mateTo

export default gameSlice.reducer
