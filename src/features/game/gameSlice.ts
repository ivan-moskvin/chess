import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { movePiece } from "../piece/pieceSlice"
import { RootState } from "../../app/store"
import { traverseInTime } from "../history/historySlice"
import { Check, Game } from "./types"
import { PieceColor } from "../piece/enums"
import { PiecePosition } from "../piece/types"

const initialState: Game = {
  turn: PieceColor.WHITE,
  check: null,
  threatPosition: null,
  mateTo: null,
  draw: false,
  gameOver: false,
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    resetGame: () => initialState,
    checkTo: (state, action: PayloadAction<Check>) => {
      state.check = {
        to: action.payload.to
      }
    },
    mateTo: (state, action: PayloadAction<PieceColor>) => {
      state.check = null
      state.mateTo = action.payload
      state.gameOver = true
    },
    clearCheck: (state, _: PayloadAction<PieceColor>) => {
      state.check = null
    },
    draw: (state) => {
      state.draw = true
      state.gameOver = true
    },
    showThreat: (state, action: PayloadAction<PiecePosition>) => {
      state.threatPosition = action.payload
    },
    hideThreat: (state) => {
      state.threatPosition = null
    },
    setThreatTrajectory: (state, action: PayloadAction<PiecePosition[]>) => {
      if (!state.check) return

      state.check.trajectory = action.payload
    }
  },
  extraReducers: builder => {
    // Toggle turn when move is done
    builder.addCase(movePiece, (state) => {
      state.turn = state.turn === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.game
    })
    builder.addCase(resetGame, () => initialState)
  }
})

export const {
  resetGame,
  checkTo,
  mateTo,
  clearCheck,
  draw,
  showThreat,
  hideThreat,
  setThreatTrajectory
} = gameSlice.actions

export const selectGame = (state: RootState) => state.game
export const selectTurn = (state: RootState) => state.game.turn
export const selectCheck = (state: RootState) => state.game.check
export const selectMate = (state: RootState) => state.game.mateTo
export const selectDraw = (state: RootState) => state.game.draw
export const selectGameOver = (state: RootState) => state.game.gameOver
export const selectThreatPosition = (state: RootState) => state.game.threatPosition

export default gameSlice.reducer
