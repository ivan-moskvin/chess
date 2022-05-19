import { PieceColor, PieceType } from "../piece/pieceSlice"
import { ISquare } from "../square/types"
import { IPiece, PiecePosition } from "../piece/types"
import { canIMove, canIMoveOrBeat, getCoordFromPosition, getPositionFromCoords } from "../piece/utils"

/**
 * Find square by position
 * @param position
 * @param squares
 */
export const findSquare = (position: PiecePosition, squares: ISquare[][]): ISquare => {
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (squares[i][j].position === position) return squares[i][j]
    }
  }

  return {} as ISquare
}

/**
 * Finds king by color
 * @param color
 * @param squares
 */
export const findKingsSquareByColor = (color: PieceColor, squares: ISquare[][]): ISquare => {
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (squares[i][j].piece?.type === PieceType.KING
        && squares[i][j].piece?.color === color
      ) {
        return squares[i][j]
      }
    }
  }

  return {} as ISquare
}

/**
 * Checks if king has place to run
 * @param kingSquare
 * @param squares
 */
export const kingCanEscape = (kingSquare: ISquare, squares: ISquare[][]): boolean => {
  const [ y, x ] = kingSquare.coords
  const positions = [
    [ y - 1, x - 1 ],
    [ y - 1, x ],
    [ y - 1, x + 1 ],
    [ y, x - 1 ],
    [ y, x + 1 ],
    [ y + 1, x - 1 ],
    [ y + 1, x ],
    [ y + 1, x + 1 ],
  ].filter(([ y, x ]) => !!squares[y] && squares[y][x])

  return positions
    .some(([ y, x ]) => {
      return canIMoveOrBeat(kingSquare.piece!, squares[y][x].position, squares)
    })
}

/**
 * Checks if there are obstacles between two squares
 * @param y0
 * @param x0
 * @param y1
 * @param x1
 * @param squares
 * @param ignoringPiecePosition
 */
export const haveObstaclesBetween = (y0: number, x0: number, y1: number, x1: number, squares: ISquare[][], ignoringPiecePosition?: PiecePosition): boolean => {
  if (y0 === y1 && x0 === x1) return false

  // If it's horizontal move
  if (y0 === y1) {
    // Check all horizontal pieces in between start and end
    for (let i = Math.min(x0, x1) + 1; i < Math.max(x0, x1); i++) {
      if (squares[y0][i]?.piece?.position === ignoringPiecePosition) continue
      if (!!squares[y0][i]?.piece?.type) return true
    }
  }

  // If it's vertical move
  if (x0 === x1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(y0, y1) + 1; i < Math.max(y0, y1); i++) {
      if (squares[i][x0]?.piece?.position === ignoringPiecePosition) continue
      if (!!squares[i][x0]?.piece?.type) return true
    }
  }

  // If it's diagonal move
  if (y1 !== y0 && x1 !== x0) {
    // Check north-west or south-east
    if ((x1 < x0 && y1 < y0) || (x1 > x0 && y1 > y0)) {
      for (let i = Math.min(y0, y1) + 1, j = Math.min(x0, x1) + 1; i < Math.max(y0, y1) && j < Math.max(x0, x1); i++, j++) {
        if (squares[i][j]?.piece?.position === ignoringPiecePosition) continue
        if (!!squares[i][j]?.piece?.type) return true
      }
    }

    // Check south-west and north-east
    if ((x1 < x0 && y1 > y0) || (x1 > x0 && y1 < y0)) {
      for (let i = Math.max(y0, y1) - 1, j = Math.min(x0, x1) + 1; i > Math.min(y0, y1) && j < Math.max(x0, x1); i--, j++) {
        if (squares[i][j]?.piece?.position === ignoringPiecePosition) continue
        if (!!squares[i][j]?.piece?.type) return true
      }
    }
  }

  return false
}
/**
 * Gets allied pieces
 * @param allyColor
 * @param squares
 */
export const getAlliedPieces = (allyColor: PieceColor, squares: ISquare[][]): IPiece[] => {
  const alliedPieces = []

  // Get allied pieces
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (!!squares[i][j].piece && squares[i][j].piece?.color === allyColor) {
        alliedPieces.push(squares[i][j].piece!)
      }
    }
  }

  return alliedPieces
}

/**
 * Gets opponent's pieces
 * @param allyColor
 * @param squares
 */
export const getOpponentsPieces = (allyColor: PieceColor, squares: ISquare[][]): IPiece[] => {
  const opponentsPieces = []

  // Get allied pieces
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (!!squares[i][j].piece && squares[i][j].piece?.color !== allyColor) {
        opponentsPieces.push(squares[i][j].piece!)
      }
    }
  }

  return opponentsPieces
}

/**
 * Checks if allied kind is disposing to threat by leaving position
 */
export const disposingKingToThreat = (protectingPosition: PiecePosition, color: PieceColor, squares: ISquare[][]): boolean => {
  const opponentsPieces = getOpponentsPieces(color, squares)
  const alliedKingsSquare = findKingsSquareByColor(color, squares)

  return opponentsPieces.some((opponentsPiece) => {
    return canIMoveOrBeat(opponentsPiece, alliedKingsSquare.position, squares, protectingPosition)
  })
}

/**
 * Checks if someone can protect king
 */
export const someoneCanProtectKing = (kingSquare: ISquare, from: ISquare, squares: ISquare[][]): boolean => {
  // Someone can go to any cell between king and threat
  const [ y1, x1 ] = getCoordFromPosition(kingSquare.position)
  const [ y0, x0 ] = getCoordFromPosition(from.position)
  const alliedPieces = getAlliedPieces(kingSquare.piece!.color, squares)

  // No one can protect from pawn or knight
  if ([ PieceType.KNIGHT, PieceType.PAWN ].includes(from.piece?.type!)) return false

  // No one can protect from contacting piece
  if (Math.abs(y0 - y1) === 1 || Math.abs(x0 - x1) === 1) return false

  // West/east
  if (y0 === y1) {
    for (let i = Math.min(x0, x1) + 1; i < Math.max(x0, x1); i++) {
      if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(y0, i), squares))) return true
    }
  }

  // North/south
  if (x0 === x1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(y0, y1) + 1; i < Math.max(y0, y1); i++) {
      if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, x0), squares))) return true
    }
  }

  // Diagonals
  if (y1 !== y0 && x1 !== x0) {
    // Check north-west or south-east
    if ((x1 < x0 && y1 < y0) || (x1 > x0 && y1 > y0)) {
      for (let i = Math.min(y0, y1) + 1, j = Math.min(x0, x1) + 1; i < Math.max(y0, y1) && j < Math.max(x0, x1); i++, j++) {
        if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, j), squares))) return true
      }
    }

    // Check south-west and north-east
    if ((x1 < x0 && y1 > y0) || (x1 > x0 && y1 < y0)) {
      // console.log(alliedPieces)
      for (let i = Math.max(y0, y1) - 1, j = Math.min(x0, x1) + 1; i > Math.min(y0, y1) && j < Math.max(x0, x1); i--, j++) {
        if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, j), squares))) return true
      }
    }
  }

  return false
}
