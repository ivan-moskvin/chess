import { createSlice } from "@reduxjs/toolkit"
import { movePieceFromTo, PieceColor } from "../piece/pieceSlice"
import { RootState } from "../../app/store"

const gameSlice = createSlice({
  name: "game",
  initialState: {
    turn: PieceColor.WHITE
  },
  reducers: {},
  extraReducers: builder => {
    // Toggle turn when move is done
    builder.addCase(movePieceFromTo, (state) => {
      state.turn = state.turn === PieceColor.BLACK ? PieceColor.WHITE : PieceColor.BLACK
    })
  }
})

export const selectTurn = (state: RootState) => state.game.turn

export default gameSlice.reducer
