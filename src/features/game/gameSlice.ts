import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { movePieceFromTo } from "../piece/pieceSlice"
import { RootState } from "../../app/store"
import { traverseInTime } from "../history/historySlice"
import { Game } from "./types"
import { PieceColor } from "../piece/enums";

const gameSlice = createSlice({
  name: "game",
  initialState: {
    turn: PieceColor.WHITE,
    checkTo: null,
    mateTo: null,
    draw: false,
    gameOver: false,
  } as Game,
  reducers: {
    checkTo: (state, action: PayloadAction<PieceColor>) => {
      state.checkTo = action.payload
    },
    mateTo: (state, action: PayloadAction<PieceColor>) => {
      state.checkTo = null
      state.mateTo = action.payload
      state.gameOver = true
    },
    clearCheck: (state, _: PayloadAction<PieceColor>) => {
      state.checkTo = null
    },
    draw: (state) => {
      state.draw = true
      state.gameOver = true
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
export const selectGameOver = (state: RootState) => state.game.gameOver

export default gameSlice.reducer
