import { createSlice } from "@reduxjs/toolkit";
import { ISquare } from "../square/squareSlice";
import { RootState } from "../../app/store";

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

export type PiecePosition = string

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

/**
 * Gets coords from position name
 * @param position
 */
export const getCoordFromPosition = (position: PiecePosition): [ rank: number, file: number ] => {
  const [ letter, digit ] = position
  const rank = 8 - +digit
  const file = letter.toLowerCase().charCodeAt(0) - 97

  return [
    rank,
    file
  ]
}

/**
 * Checks can I move that piece
 * @param piece
 * @param to
 * @param squares
 */
export const canIMove = (piece: IPiece, to: PiecePosition, squares: ISquare[][]): boolean => {
  const { type, color, position } = piece;
  if (!position) return false;

  const [ [ y0, x0 ], [ y1, x1 ] ] = [ getCoordFromPosition(position), getCoordFromPosition(to) ]

  const dy = Math.abs(y1 - y0)
  const dx = Math.abs(x1 - x0)


  switch (type) {
    case PieceType.PAWN:
      // If it's diagonals, we can only beat
      if (dx === 1 && dy === 1) {
        if (!squares[y1][x1].piece) return false
      }
      // Can move 2 cells far only for the first move
      if (dy === 2) {
        if (dx > 0) return false
        return color === PieceColor.BLACK ? y0 < 2 : y0 > 5
      }
      // Cannot move more then 2 cells far
      if (dy > 2) return false

      // Cannot move horizontally
      if (dx > 0 && dy === 0) return false

      // Blacks and whites restrictions
      return color === PieceColor.BLACK ? y1 >= y0 : y0 >= y1
    case PieceType.ROOK:
      // Cannot move diagonally
      return !(dx > 0 && dy > 0);
    case PieceType.KNIGHT:
      // Can do only L-type moves
      return (dy === 2 && dx === 1) ||
        (dy === 1 && dx === 2)

    case PieceType.BISHOP:
      // Can move only diagonally
      return dy === dx
    case PieceType.QUEEN:
      // Can move either diagonally or vertically
      return dy === dx
        || (dy === 0 && dx > 0)
        || (dx === 0 && dy > 0)
    case PieceType.KING:
      // Can move only 1 cell far
      if (dy > 1 || dx > 1) return false

      // Can move either diagonally or vertically
      return dy === dx
        || (dy === 0 && dx > 0)
        || (dx === 0 && dy > 0)
  }

  return false
}

/**
 * Checks if can beat piece
 * @param me
 * @param destinationPiece
 */
export const canIBeat = (me: IPiece, destinationPiece: IPiece): boolean => {
  const opponentsColor = destinationPiece.color
  const { type, color, position } = me

  const [ , y ] = getCoordFromPosition(position!)
  const [ , opponentsY ] = getCoordFromPosition(destinationPiece.position!)

  if (type === PieceType.PAWN) {
    return y !== opponentsY
  }

  return color !== opponentsColor;
}

export const { setCurrent } = pieceSlice.actions

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer