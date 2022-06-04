import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { traverseInTime } from "../history/historySlice"
import { ModifyType, Movement, Piece, PlacePiece } from "./types"

const initialState = {
  current: {} as Piece
}

const pieceSlice = createSlice({
  name: "piece",
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Piece>) => {
      state.current = action.payload
    },
    clearCurrent: (state) => {
      state.current = {} as Piece
    }
  },
  extraReducers: (builder => {
    builder.addCase(dropPiece, (state) => {
      state.current = {} as Piece
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.piece
    })
  })
})

export const dropPiece = createAction<void>("piece/drop")
export const placePiece = createAction<PlacePiece>("piece/place")
export const modifyPieceType = createAction<ModifyType>("piece/modify-type")
export const movePiece = createAction<Movement>("piece/move-from-to")

export const { setCurrent } = pieceSlice.actions

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
