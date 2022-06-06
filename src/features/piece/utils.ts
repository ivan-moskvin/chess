import { Piece, PiecePosition } from "./types"
import { Squares } from "../square/types"
import { buildPossibleMovements, getAlliedPieces, getOpponentsPieces } from "../board/utils"
import { PieceColor, PieceType } from "./enums"

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
 * @param rank
 * @param file
 */
export const getPositionFromCoords = (rank: number, file: number): PiecePosition => {
  return `${ String.fromCharCode(97 + file).toUpperCase() }${ 8 - rank }`
}

/**
 * Checks if square protected
 * @param pos
 * @param color
 * @param sqaures
 */
export const isSquareProtected = (pos: PiecePosition, color: PieceColor, sqaures: Squares) => {
  const opponentsPieces = getOpponentsPieces(color, sqaures)

  for (let piece of opponentsPieces) {
    for (let move of buildPossibleMovements(piece, sqaures)) {
      if (move === pos) return true
    }
  }

  return false
}

/**
 * Return king's possible castling directions
 * @param king
 * @param squares
 * @return [left side, right side]
 */
export const castlingDirections = (king: Piece, squares: Squares): [ left: boolean, right: boolean ] => {
  if (king.underCheck) return [ false, false ]
  if (king.moved) return [ false, false ]

  const [ rank ] = getCoordFromPosition(king.position)

  const canICastle = (direction: string): boolean => {
    if (direction === "left") {
      return [ 1, 2, 3 ].every((file) => !isSquareProtected(getPositionFromCoords(rank, file), king.color, squares))
    }

    return [ 5, 6 ].every((file) => !isSquareProtected(getPositionFromCoords(rank, file), king.color, squares))
  }

  return [ canICastle("left"), canICastle("right") ]
}

/**
 * Checks if rook ready for castle
 * @param rook
 * @param squares
 */
export const rookReadyForCastle = (rook: Piece, squares: Squares): boolean => {
  const [ rank, file ] = getCoordFromPosition(rook.position)

  // Check left rook
  if (file === 0) {
    for (let i = 1; i <= 3; i++) {
      if (!!squares[rank][i]?.piece) return false
    }

    return true
  }

  // Check right rook
  return !squares[rank][6]?.piece && !squares[rank][5]?.piece
}

/**
 * Gets allied rooks which haven't been moved
 * @param piece
 * @param squares
 */
export const getAlliedRooksUnmoved = (piece: Piece, squares: Squares): Piece[] => {
  const { color } = piece

  return getAlliedPieces(color, squares)
    .filter((piece) => piece.type === PieceType.ROOK)
    .filter((rook) => !rook.moved)
}

/**
 * Gets piece map name
 * @param type
 * @param color
 */
export const getPieceMapName = ({ type, color }: Partial<Piece>): string => `${ color }_${ type }`

/**
 * Filter kings moves
 * @param possibleMovements
 * @param color
 * @param squares
 */
export const filterKingsMoves = (possibleMovements: Set<PiecePosition>, color: PieceColor, squares: Squares) => {
  // Find enemy pieces
  const threateningPieces = getOpponentsPieces(color, squares)

  // Build their trajectories
  const threateningMovements = threateningPieces.reduce<Set<PiecePosition>>((acc, cur) => {
    for (let pos of buildPossibleMovements(cur, squares, true)) {
      acc.add(pos!)
    }
    return acc
  }, new Set())

  // Filter your trajectories excluding pieces in enemy trajectories
  for (let threateningMove of Array.from(threateningMovements)) {
    if (possibleMovements.has(threateningMove)) {
      possibleMovements.delete(threateningMove)
    }
  }

  return possibleMovements
}
