import { PieceColor, PieceType } from "./pieceSlice"
import { IPiece, PiecePosition } from "./types"
import { ISquare } from "../square/types"
import { haveObstaclesBetween } from "../board/utils"

/**
 * Gets unicode piece symbol
 * @param type
 * @param color
 */
export const getPieceIcon = (type: PieceType, color: PieceColor): string => {
  switch (type) {
    case PieceType.PAWN:
      return color === PieceColor.BLACK ? "\u265f" : "\u2659"
    case PieceType.ROOK:
      return color === PieceColor.BLACK ? "\u265c" : "\u2656"
    case PieceType.KNIGHT:
      return color === PieceColor.BLACK ? "\u265e" : "\u2658"
    case PieceType.BISHOP:
      return color === PieceColor.BLACK ? "\u265d" : "\u2657"
    case PieceType.QUEEN:
      return color === PieceColor.BLACK ? "\u265b" : "\u2655"
    case PieceType.KING:
      return color === PieceColor.BLACK ? "\u265a" : "\u2654"
  }

  return ""
}

/**
 * Checks if piece has color different from provided
 * @param piece
 * @param color
 */
export const pieceHasDiffColor = (piece: IPiece, color: PieceColor): boolean => !!piece && piece.color !== color

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
  return `${ String.fromCharCode(97 + x).toUpperCase() }${ 8 - y }`
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
  if (piece.position === to) return false

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
/**
 * Checks if square is protected
 * @param to
 * @param fromColor
 * @param squares
 */
export const isSquareProtected = (to: PiecePosition, fromColor: PieceColor, squares: ISquare[][]): boolean => {
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
            return true
          }
          continue
        }

        //  and this piece can move to 'to' - square is protected
        if (piece!.type !== PieceType.PAWN) {
          if (canIMove(piece!, to, squares)) {
            return true
          }
        }

        // Process pawn logic
        if (canBeBeatenByPawn(piece!, to, fromColor)) {
          return true
        }
      }
    }
  }

  // Otherwise, square is not protected
  return false
}
