import { Square, Squares } from "../square/types"
import { Piece, PiecePosition } from "../piece/types"
import { canIMove, canIMoveOrBeat, getCoordFromPosition, getPositionFromCoords } from "../piece/utils"
import { PieceColor, PieceType } from "../piece/enums";

/**
 * Gets opponents color
 * @param color
 */
export const getOpponentsColor = (color: PieceColor): PieceColor => {
  return color === PieceColor.BLACK
    ? PieceColor.WHITE
    : PieceColor.BLACK
}

/**
 * Find square by position
 * @param position
 * @param squares
 */
export const findSquare = (position: PiecePosition, squares: Squares): Square => {
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (squares[i][j].position === position) return squares[i][j]
    }
  }

  return {} as Square
}

/**
 * Finds king by color
 * @param color
 * @param squares
 */
export const findKingsSquareByColor = (color: PieceColor, squares: Squares): Square => {
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[0].length; j++) {
      if (squares[i][j].piece?.type === PieceType.KING
        && squares[i][j].piece?.color === color
      ) {
        return squares[i][j]
      }
    }
  }

  return {} as Square
}

/**
 * Checks if king has place to run
 * @param kingSquare
 * @param squares
 */
export const kingCanEscape = (kingSquare: Square, squares: Squares): boolean => {
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
export const haveObstaclesBetween = (y0: number, x0: number, y1: number, x1: number, squares: Squares, ignoringPiecePosition?: PiecePosition): boolean => {
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
export const getAlliedPieces = (allyColor: PieceColor, squares: Squares): Piece[] => {
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
export const getOpponentsPieces = (allyColor: PieceColor, squares: Squares): Piece[] => {
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
 * Checks if allied king is disposed to threat by leaving position
 */
export const disposingKingToThreat = (protectingPosition: PiecePosition, color: PieceColor, squares: Squares): boolean => {
  const opponentsPieces = getOpponentsPieces(color, squares)
  const alliedKingsSquare = findKingsSquareByColor(color, squares)

  return opponentsPieces.some((opponentsPiece) => {
    return canIMoveOrBeat(opponentsPiece, alliedKingsSquare.position, squares, protectingPosition)
  })
}

/**
 * Checks if someone can protect king
 */
export const someoneCanProtectKing = (kingSquare: Square, from: Square, squares: Squares): boolean => {
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
      if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(y0, i), squares, getPositionFromCoords(i, x0)))) return true
    }
  }

  // North/south
  if (x0 === x1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(y0, y1) + 1; i < Math.max(y0, y1); i++) {
      if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, x0), squares, getPositionFromCoords(i, x0)))) return true
    }
  }

  // Diagonals
  if (y1 !== y0 && x1 !== x0) {
    // Check north-west or south-east
    if ((x1 < x0 && y1 < y0) || (x1 > x0 && y1 > y0)) {
      for (let i = Math.min(y0, y1) + 1, j = Math.min(x0, x1) + 1; i < Math.max(y0, y1) && j < Math.max(x0, x1); i++, j++) {
        if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, j), squares, getPositionFromCoords(i, j)))) return true
      }
    }

    // Check south-west and north-east
    if ((x1 < x0 && y1 > y0) || (x1 > x0 && y1 < y0)) {
      // console.log(alliedPieces)
      for (let i = Math.max(y0, y1) - 1, j = Math.min(x0, x1) + 1; i > Math.min(y0, y1) && j < Math.max(x0, x1); i--, j++) {
        if (alliedPieces.some((piece) => canIMove(piece, getPositionFromCoords(i, j), squares, getPositionFromCoords(i, j)))) return true
      }
    }
  }

  return false
}

/**
 * Builds vertical positions
 * @param from
 * @param to
 * @param x
 * @param color
 * @param squares
 * @param ignorePosition
 */
export const buildVerticalPositions = (from: number, to: number, x: number, color: PieceColor, squares: Squares, ignorePosition?: PiecePosition): PiecePosition[] => {
  const positions: PiecePosition[] = []


  if (from === to) return positions

  // North
  if (from > to) {
    let opponentBeaten = false
    for (let i = from - 1; i >= to; i--) {

      // Hit allied piece
      if (squares[i][x]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[i][x]?.piece && squares[i][x].piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }

      positions.push(squares[i][x].position)
    }
  }

  // South
  for (let i = from + 1; i <= to; i++) {
    let opponentBeaten = false
    // Hit allied piece
    if (squares[i][x]?.piece?.color === color) return positions

    // Hit enemy piece
    if (!!squares[i][x]?.piece && squares[i][x]?.piece?.color !== color) {
      // If already
      if (opponentBeaten) return positions
      opponentBeaten = true
    }

    positions.push(squares[i][x].position)
  }

  return positions
}

/**
 * Builds horizontal positions
 * @param from
 * @param to
 * @param y
 * @param color
 * @param squares
 * @param ignorePosition
 */
export const buildHorizontalPositions = (from: number, to: number, y: number, color: PieceColor, squares: Squares, ignorePosition?: PiecePosition): PiecePosition[] => {
  const positions: PiecePosition[] = []

  if (from === to) return positions

  let opponentBeaten = false

  // North
  if (from > to) {
    for (let i = from - 1; i >= to; i--) {
      // Hit allied piece
      if (squares[y][i]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[y][i]?.piece && squares[y][i]?.piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }

      positions.push(squares[y][i].position)
    }
  }

  // South
  for (let i = from + 1; i <= to; i++) {
    // Hit allied piece
    if (squares[y][i]?.piece?.color === color) return positions

    // Hit enemy piece
    if (!!squares[y][i]?.piece && squares[y][i]?.piece.color !== color) {
      // If already
      if (opponentBeaten) return positions
      opponentBeaten = true
    }

    positions.push(squares[y][i].position)
  }

  return positions
}

/**
 * Builds diagonal positions
 * @param fromX
 * @param fromY
 * @param toX
 * @param toY
 * @param color
 * @param squares
 * @param ignorePosition
 */
export const buildDiagonalPositions = (fromX: number, fromY: number, toX: number, toY: number, color: PieceColor, squares: Squares, ignorePosition?: PiecePosition): PiecePosition[] => {
  const positions: PiecePosition[] = []

  let opponentBeaten = false

  // North-west
  if ((toX < fromX && toY < fromY)) {
    for (let i = fromY - 1, j = fromX - 1; i >= toY && j >= toX; i--, j--) {
      // Hit allied piece
      if (squares[i][j]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[i][j]?.piece && squares[i][j]?.piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }


      positions.push(squares[i][j].position)
    }
  }

  // South-east
  if ((toX > fromX && toY > fromY)) {
    for (let i = fromY + 1, j = fromX + 1; i <= toY && j <= toX; i++, j++) {
      // Hit allied piece
      if (squares[i][j]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[i][j]?.piece && squares[i][j]?.piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }
      positions.push(squares[i][j].position)
    }
  }

  // South-west
  if ((toX < fromX && toY > fromY)) {
    for (let i = fromY + 1, j = fromX - 1; i <= toY && j >= toX; i++, j--) {
      // Hit allied piece
      if (squares[i][j]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[i][j]?.piece && squares[i][j]?.piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }
      positions.push(squares[i][j].position)
    }
  }

  // North-east
  if ((toX > fromX && toY < fromY)) {
    for (let i = fromY - 1, j = fromX + 1; i >= toY && j <= toX; i--, j++) {
      // Hit allied piece
      if (squares[i][j]?.piece?.color === color) return positions

      // Hit enemy piece
      if (!!squares[i][j]?.piece && squares[i][j]?.piece.color !== color) {
        // If already
        if (opponentBeaten) return positions
        opponentBeaten = true
      }
      positions.push(squares[i][j].position)
    }
  }


  return positions
}