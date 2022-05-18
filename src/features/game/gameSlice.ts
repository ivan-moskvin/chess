import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { movePieceFromTo, PieceColor } from "../piece/pieceSlice"
import { RootState } from "../../app/store"
import { traverseInTime } from "../history/historySlice";

export interface Game {
  turn: PieceColor,
  checkTo: PieceColor | null,
  mateTo: PieceColor | null,
  draw: boolean,
}

const gameSlice = createSlice({
  name: "game",
  initialState: {
    turn: PieceColor.WHITE,
    checkTo: null,
    mateTo: null,
    draw: false,
  } as Game,
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
    },
    draw: (state) => {
      state.draw = true
    }
  },
  extraReducers: builder => {
    // Toggle turn when move is done
    builder.addCase(movePieceFromTo, (state) => {
      state.turn = state.turn === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.game
    })
  }
})

export const { checkTo, mateTo, clearCheck, draw } = gameSlice.actions

export const selectTurn = (state: RootState) => state.game.turn
export const selectCheck = (state: RootState) => state.game.checkTo
export const selectMate = (state: RootState) => state.game.mateTo
export const selectDraw = (state: RootState) => state.game.draw

export default gameSlice.reducer
