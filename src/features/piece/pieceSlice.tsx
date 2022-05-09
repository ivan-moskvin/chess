import {createSlice} from "@reduxjs/toolkit";

export enum PieceType {
  KING = "King",
  QUEEN = "Queen",
  ROOK = "Rook",
  BISHOP = "Bishop",
  KNIGHT = "Knight",
  PAWN = "Pawn"
}

export enum PieceColor {
  BLACK = "Black",
  WHITE = "White"
}

export interface IPiece {
  position?: string,
  type?: PieceType,
  color?: PieceColor
}

const pieceSlice = createSlice({
  name: 'piece',
  initialState: {
    current: {} as IPiece
  },
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload
    }
  }
})

export const { setCurrent } = pieceSlice.actions

export default pieceSlice.reducer