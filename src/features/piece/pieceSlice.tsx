import { createAction, createSlice } from "@reduxjs/toolkit"
import { ISquare } from "../square/squareSlice"
import { AppThunk, RootState } from "../../app/store"
import { haveObstaclesBetween, processGameState } from "../board/boardSlice"

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
  type: PieceType,
  color: PieceColor
}

export interface Movement {
  from: string,
  to: string,
  piece: IPiece,
}

export type PiecePosition = string

const pieceHasDiffColor = (piece: IPiece, color: PieceColor): boolean => !!piece && piece.color !== color

const pieceSlice = createSlice({
  name: "piece",
  initialState: {
    current: {} as IPiece
  },
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload
    }
  },
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
 * Gets position name from coordinates
 * @param y
 * @param x
 */
export const getPositionFromCoords = (y: number, x: number): PiecePosition => {
  return `${String.fromCharCode(97 + x).toUpperCase()}${8 - y}`
}


/**
 * Checks if square can be beaten by pawn
 * @param pawnPiece
 * @param to
 * @param color
 */
const canBeBeatenByPawn = (pawnPiece: IPiece, to: PiecePosition, color: PieceColor): boolean => {
  const [ y, x ] = getCoordFromPosition(to)
  const [ pawnY, pawnX ] = getCoordFromPosition(pawnPiece.position)

  if (Math.abs(pawnX - x) !== 1) return false

  return color === PieceColor.BLACK
    ? pawnY === y + 1
    : pawnY === y - 1
}

/**
 * Checks if square can be beaten by king
 * @param kingPiece
 * @param to
 */
const canBeBeatenByKing = (kingPiece: IPiece, to: PiecePosition): boolean => {
  const [ y, x ] = getCoordFromPosition(to)
  const [ kingY, kingX ] = getCoordFromPosition(kingPiece.position)

  if (Math.abs(kingX - x) > 1 || Math.abs(kingY - y) > 1) return false

  return Math.abs(kingX - x) <= 1 && Math.abs(kingY - y) <= 1
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

  const [ [ y0, x0 ], [ y1, x1 ] ] = [ getCoordFromPosition(position), getCoordFromPosition(to) ]

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

      if (isSquareProtected(to, color!, squares)) return false

      // Can move either diagonally or vertically
      return dy === dx
        || (dy === 0 && dx > 0)
        || (dx === 0 && dy > 0)
  }

  return false
}

/**
 * Checks if square can be beaten by anyone
 * @param square
 * @param to
 * @param fromColor
 * @param squares
 */
export const isSquareCanBeBeaten = (square: ISquare, to: PiecePosition, fromColor: PieceColor, squares: ISquare[][]) => {
  return !square?.piece && isSquareProtected(to, fromColor, squares)
}

/**
 * Checks if square is protected
 * @param to
 * @param fromColor
 * @param squares
 * @param debug
 */
export const isSquareProtected = (to: PiecePosition, fromColor: PieceColor, squares: ISquare[][], debug?: boolean): boolean => {
  // Traverse all squares
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      const piece = squares[i][j]?.piece
      //  If square has piece
      //  and piece's color is differs from the fromColor(our color)
      if (pieceHasDiffColor(piece!, fromColor)) {
        // Process king logic to prevent infinite recursion
        if (piece!.type === PieceType.KING) {
          if (canBeBeatenByKing(piece!, to)) {
            if (debug) debugger
            return true
          }
          continue
        }

        //  and this piece can move to 'to' - square is protected
        if (piece!.type !== PieceType.PAWN) {
          if (canIMove(piece!, to, squares)) {
            if (debug) debugger
            return true
          }
        }

        // Process pawn logic
        if (canBeBeatenByPawn(piece!, to, fromColor)) {
          if (debug) debugger
          return true
        }
      }
    }
  }

  // Otherwise, square is not protected
  return false
}

/**
 * Moving piece to square
 * @param to
 */
export const movePieceTo = (to: PiecePosition): AppThunk => (dispatch, getState) => {
  const getCurrent = () => getState().piece.current
  const current = getCurrent()

  dispatch(pieceSlice.actions.setCurrent({ ...current, position: to }))
  dispatch(movePieceFromTo({ from: current.position as PiecePosition, to, piece: getCurrent() }))
  dispatch(processGameState())
}

/**
 * Checks if can move or beat piece
 * @param piece
 * @param to
 * @param squares
 */
export const canIMoveOrBeat = (piece: IPiece, to: PiecePosition, squares: ISquare[][]): boolean => {
  const [ y, x ] = getCoordFromPosition(to)
  const destinationSquare = squares[y][x]
  const destinationPiece = destinationSquare.piece

  // If current piece cannot move that way return
  if (!canIMove(piece, to, squares)) return false

  return !destinationPiece || canIBeat(piece, destinationPiece!)
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

  return color !== opponentsColor
}

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
