import { createAction, createSlice } from "@reduxjs/toolkit"
import { ISquare } from "../square/squareSlice"
import { AppThunk, RootState } from "../../app/store"

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
  position: string,
  type?: PieceType,
  color?: PieceColor
}

export interface Movement {
  from: string,
  to: string,
  piece: IPiece,
}

export type PiecePosition = string

const pieceSlice = createSlice({
  name: "piece",
  initialState: {
    current: {} as IPiece
  },
  reducers: {},
  extraReducers: (builder => {
    builder.addCase(dragPiece, (state, action) => {
      state.current = action.payload
    })
    builder.addCase(dropPiece, (state) => {
      state.current = {} as IPiece
    })
  })
})

export const dragPiece = createAction<IPiece>("piece/drag")
export const dropPiece = createAction<void>("piece/drop")
export const placePiece = createAction<IPiece>("piece/place")
export const movePieceFromTo = createAction<Movement>("piece/move-from-to")

/**
 * Gets coords from position name
 * @param position
 */
export const getCoordFromPosition = (position: PiecePosition): [rank: number, file: number] => {
  const [letter, digit] = position
  const rank = 8 - +digit
  const file = letter.toLowerCase().charCodeAt(0) - 97

  return [
    rank,
    file
  ]
}

/**
 * Checks if there are obstacles between two squares
 * @param y0
 * @param x0
 * @param y1
 * @param x1
 * @param squares
 */
export const haveObstaclesBetween = (y0: number, x0: number, y1: number, x1: number, squares: ISquare[][]): boolean => {
  if (y0 === y1 && x0 === x1) return false

  // If it's horizontal move
  if (y0 === y1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(x0, x1) + 1; i < Math.max(x0, x1); i++) {
      if (squares[y0][i].piece?.type) return true
    }
  }

  // If it's vertical move
  if (x0 === x1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(y0, y1) + 1; i < Math.max(y0, y1); i++) {
      if (!!squares[i][x0].piece?.type) return true
    }
  }

  // If it's diagonal move
  if (y1 !== y0 && x1 !== x0) {
    // Check north-west or south-east
    if ((x1 < x0 && y1 < y0) || (x1 > x0 && y1 > y0)) {
      for (let i = Math.min(y0, y1) + 1, j = Math.min(x0, x1) + 1; i < Math.max(y0, y1) && j < Math.max(x0, x1); i++, j++) {
        const res = !!squares[i][j].piece?.type
        if (res) return true
      }
    }

    // Check south-west and north-east
    if ((x1 < x0 && y1 > y0) || (x1 > x0) && (y1 < y0)) {
      for (let i = Math.max(y0, y1) - 1, j = Math.min(x0, x1) + 1; i > Math.min(y0, y1) && j < Math.max(x0, x1); i--, j++) {
        if (!!squares[i][j].piece?.type) return true
      }
    }
  }

  return false
}

/**
 * Checks can I move that piece
 * @param piece
 * @param to
 * @param squares
 */
export const canIMove = (piece: IPiece, to: PiecePosition, squares: ISquare[][]): boolean => {
  const { type, color, position } = piece
  if (!position) return false

  const [[y0, x0], [y1, x1]] = [getCoordFromPosition(position), getCoordFromPosition(to)]

  const dy = Math.abs(y1 - y0)
  const dx = Math.abs(x1 - x0)


  switch (type) {
    case PieceType.PAWN:
      // If it's diagonals, we can only beat
      if (dx === 1 && dy === 1) {
        if (!squares[y1][x1].piece
          // We cannot beat friendly pieces
          || squares[y1][x1].piece!.color === color) return false
      }

      // Can move 2 cells far only for the first move
      if (dy === 2) {
        if (dx > 0) return false
        return color === PieceColor.BLACK ? y0 < 2 : y0 > 5
      }

      // Cannot move more than 2 cells far horizontally
      if (dx > 1) return false

      // Cannot move more than 2 cells far vertically
      if (dy > 2) return false

      // Cannot move horizontally
      if (dx > 0 && dy === 0) return false

      // Cannot move backwards
      return color === PieceColor.BLACK ? y1 >= y0 : y0 >= y1
    case PieceType.ROOK:
      // Cannot move diagonally
      return !(dx > 0 && dy > 0) && !haveObstaclesBetween(y0, x0, y1, x1, squares)
    case PieceType.KNIGHT:
      // Can do only L-type moves
      return (dy === 2 && dx === 1) ||
        (dy === 1 && dx === 2)

    case PieceType.BISHOP:
      // Can move only diagonally
      return dy === dx && !haveObstaclesBetween(y0, x0, y1, x1, squares)
    case PieceType.QUEEN:
      // Can move either diagonally or vertically
      return !haveObstaclesBetween(y0, x0, y1, x1, squares)
        && (dy === dx
          || (dy === 0 && dx > 0)
          || (dx === 0 && dy > 0))
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
 * Moving piece to square
 * @param to
 */
export const movePieceTo = (to: PiecePosition): AppThunk => (dispatch, getState) => {
  const { piece: { current } } = getState()

  dispatch(movePieceFromTo({ from: current.position as PiecePosition, to, piece: { ...current, position: to } }))
}

/**
 * Checks if can move or beat piece
 * @param current
 * @param to
 * @param squares
 */
export const canIMoveOrBeat = (current: IPiece, to: PiecePosition, squares: ISquare[][]): boolean => {
  const [y, x] = getCoordFromPosition(to)
  const destinationSquare = squares[y][x]
  const destinationPiece = destinationSquare.piece

  // If current piece cannot move that way return
  if (!canIMove(current, to, squares)) return false

  return !destinationPiece || canIBeat(current, destinationPiece!)
}

/**
 * Checks if can beat piece
 * @param me
 * @param destinationPiece
 */
export const canIBeat = (me: IPiece, destinationPiece: IPiece): boolean => {
  const opponentsColor = destinationPiece.color
  const { type, color, position } = me

  const [, y] = getCoordFromPosition(position!)
  const [, opponentsY] = getCoordFromPosition(destinationPiece.position!)

  if (type === PieceType.PAWN) {
    return y !== opponentsY
  }

  return color !== opponentsColor
}

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
