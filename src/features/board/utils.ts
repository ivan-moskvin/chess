import { Square, Squares } from "../square/types"
import { Piece, PiecePosition } from "../piece/types"
import { filterKingsMoves, getCoordFromPosition, getPositionFromCoords } from "../piece/utils"
import { PieceColor, PieceType } from "../piece/enums"
import { TrajectoryDirection } from "./enums"

/**
 * Gets piece by position
 */
export const getPiece = (pos: PiecePosition, squares: Squares): Piece | null => {
  const [ y, x ] = getCoordFromPosition(pos)

  return squares[y][x]?.piece
}

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
 * Builds trajectory from starting point and direction
 * @param start
 * @param direction
 * @param color
 * @param squares
 * @param protectingAlly
 */
export const buildTrajectory = ({
                                  start,
                                  direction,
                                  color,
                                  squares,
                                  protectingAlly = false
                                }: {
  start: PiecePosition,
  direction: TrajectoryDirection,
  color: PieceColor,
  squares: Squares,
  protectingAlly?: boolean
}): PiecePosition[] => {
  let [ currentRank, currentFile ] = getCoordFromPosition(start)
  let positions: PiecePosition[] = []
  let opponentBeaten = false
  let verticalPointer: number = currentRank
  let horizontalPointer: number = currentFile
  let ignoreY: number, ignoreX: number

  const [ startY, startX ] = [ currentRank, currentFile ]

  switch (direction) {
    case TrajectoryDirection.NORTH:
      horizontalPointer = 0
      verticalPointer = -1
      break
    case TrajectoryDirection.NORTHEAST:
      horizontalPointer = 1
      verticalPointer = -1
      break
    case TrajectoryDirection.EAST:
      horizontalPointer = 1
      verticalPointer = 0
      break
    case TrajectoryDirection.SOUTHEAST:
      horizontalPointer = 1
      verticalPointer = 1
      break
    case TrajectoryDirection.SOUTH:
      horizontalPointer = 0
      verticalPointer = 1
      break
    case TrajectoryDirection.SOUTHWEST:
      horizontalPointer = -1
      verticalPointer = 1
      break
    case TrajectoryDirection.WEST:
      horizontalPointer = -1
      verticalPointer = 0
      break
    case TrajectoryDirection.NORTHWEST:
      horizontalPointer = -1
      verticalPointer = -1
      break
  }

  const isInBoundaries = (y: number, x: number): boolean => y < squares.length
    && y >= 0
    && x < squares.length
    && x >= 0

  const isIgnored = (y: number, x: number): boolean => y === ignoreY && x === ignoreX

  const isHittingAlly = (y: number, x: number): boolean => {
    if (y === startY && x === startX) return false
    return !!squares[y][x]?.piece && squares[y][x].piece.color === color
  }

  const isHittingOpponent = (y: number, x: number): boolean => {
    return !!squares[y][x]?.piece && squares[y][x].piece.color !== color
  }

  while (
    (
      isInBoundaries(currentRank, currentFile)
      || isIgnored(currentRank, currentFile)
    )
    && !isHittingAlly(currentRank, currentFile)
    && !opponentBeaten
    ) {
    currentFile += horizontalPointer
    currentRank += verticalPointer
    if (!isInBoundaries(currentRank, currentFile)) break
    if (isHittingAlly(currentRank, currentFile)) {
      if (!protectingAlly) break

      // Count hitting ally as opponent hit
      opponentBeaten = true
    }

    positions.push(squares[currentRank][currentFile].position)

    if (isHittingOpponent(currentRank, currentFile)) {
      opponentBeaten = true
    }
  }

  return positions
}

/**
 * Builds possible movements
 * @param piece
 * @param protectingAlly
 * @param squares
 * @param ignoreKing
 */
export const buildPossibleMovements = (piece: Piece, squares: Squares, protectingAlly: boolean = false, ignoreKing: boolean = true): Set<PiecePosition> => {
  const { type, color, coords: { rank, file } } = piece
  const positions = new Set<PiecePosition>()

  /**
   * TODO: extract movement patterns to somewhere else
   */
  switch (type) {
    case PieceType.PAWN:
      if (color === PieceColor.BLACK) {
        if (rank < 6) {
          positions.add(getPositionFromCoords(rank + 1, file))
        }
        if (!piece.moved) {
          positions.add(getPositionFromCoords(rank + 2, file))
        }

        // Diagonals
        if (!!squares[rank + 1][file + 1]?.piece
          && (squares[rank + 1][file + 1].piece?.color !== color || protectingAlly)) {

          positions.add(getPositionFromCoords(rank + 1, file + 1))
        }
        if (!!squares[rank + 1][file - 1]?.piece
          && (squares[rank + 1][file - 1].piece?.color !== color || protectingAlly)) {
          positions.add(getPositionFromCoords(rank + 1, file - 1))
        }
      } else {
        if (rank > 1) {
          positions.add(getPositionFromCoords(rank - 1, file))
        }
        if (!piece.moved) {
          positions.add(getPositionFromCoords(rank - 2, file))
        }

        // Diagonals
        if (!!squares[rank - 1][file + 1]?.piece
          && (squares[rank - 1][file + 1].piece?.color !== color || protectingAlly)) {

          positions.add(getPositionFromCoords(rank - 1, file + 1))
        }
        if (!!squares[rank - 1][file - 1]?.piece
          && (squares[rank - 1][file - 1].piece?.color !== color || protectingAlly)) {
          positions.add(getPositionFromCoords(rank - 1, file - 1))
        }
      }

      break
    case PieceType.ROOK:
      for (let pos of [
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTH,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTH,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.WEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.EAST,
          color: color,
          squares: squares,
          protectingAlly
        }),
      ]) positions.add(pos)
      break
    case PieceType.KNIGHT:
      // All of L-type moves
      for (
        let [ y, x ] of [
        [ rank - 2, file - 1 ],
        [ rank - 2, file + 1 ],
        [ rank - 1, file - 2 ],
        [ rank - 1, file + 2 ],
        [ rank + 2, file - 1 ],
        [ rank + 2, file + 1 ],
        [ rank + 1, file - 2 ],
        [ rank + 1, file + 2 ],
      ]
        // In boundaries
        .filter(([ y, x ]) =>
          y >= 0
          && y < squares.length
          && x >= 0
          && x < squares.length
        )
        // No piece or piece has diff color
        .filter(([ y, x ]) => !squares[y][x]?.piece || squares[y][x].piece.color !== color || protectingAlly
        )
        ) {
        positions.add(squares[y][x].position)
      }
      break
    case PieceType.BISHOP:
      for (let pos of [
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTHWEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTHEAST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTHWEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTHEAST,
          color: color,
          squares: squares,
          protectingAlly
        })
      ]) positions.add(pos)
      break
    case PieceType.QUEEN:
      for (let pos of [
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTH,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTH,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.WEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.EAST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTHWEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.NORTHEAST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTHWEST,
          color: color,
          squares: squares,
          protectingAlly
        }),
        ...buildTrajectory({
          start: piece.position,
          direction: TrajectoryDirection.SOUTHEAST,
          color: color,
          squares: squares,
          protectingAlly
        })
      ]) positions.add(pos)
      break
    case PieceType.KING:
      [
        [ rank - 1, file - 1 ],
        [ rank - 1, file ],
        [ rank - 1, file + 1 ],
        [ rank, file - 1 ],
        [ rank, file + 1 ],
        [ rank + 1, file - 1 ],
        [ rank + 1, file ],
        [ rank + 1, file + 1 ]
      ]
        .filter(([ y, x ]) => y >= 0 && y < 8 && x > 0 && x < 8)
        .forEach(([ y, x ]) => {
          if (!squares[y][x]?.piece || squares[y][x].piece.color !== color || protectingAlly) {
            positions.add(getPositionFromCoords(y, x))
          }
        })
      break
  }

  // Do not exclude king from beating position if necessary
  if (!ignoreKing) return positions

  // Cannot beat king anyway
  return new Set([ ...positions ].filter((pos) => {
    const [ y, x ] = getCoordFromPosition(pos)
    return squares[y][x]?.piece?.type !== PieceType.KING
  }))
}

/**
 * Checks if it's draw
 * @param opponentsColor
 * @param opponentsKing
 * @param squares
 */
export const isDraw = (opponentsColor: PieceColor, opponentsKing: Square, squares: Squares): boolean => {
  // If opponent has pieces besides king
  if (getAlliedPieces(opponentsColor, squares).length > 1) return false

  const kingsMoves = filterKingsMoves(buildPossibleMovements(opponentsKing.piece, squares), opponentsColor, squares)

  // If opponent's king has no place to go
  return kingsMoves.size === 0
}

/**
 * Finds threat's position
 * @param to
 * @param squares
 */
export const findThreatPosition = (to: PieceColor, squares: Squares): PiecePosition | null => {
  const allyKing = findKingsSquareByColor(to, squares)
  const opponentsPieces = getOpponentsPieces(to, squares)

  for (let piece of opponentsPieces) {
    const moves = buildPossibleMovements(piece, squares, false, false)
    if (moves.has(allyKing.position)) {
      return piece.position
    }
  }

  return null
}

/**
 * Finds threat trajectory
 * @param to
 * @param squares
 */
export const buildThreatTrajectory = (to: PieceColor, squares: Squares): PiecePosition[] => {
  const allyKing = findKingsSquareByColor(to, squares)
  const [ y1, x1 ] = getCoordFromPosition(allyKing.position)
  const opponentsColor = getOpponentsColor(allyKing.color)
  const opponentsPieces = getOpponentsPieces(to, squares).filter((piece) => [
    PieceType.QUEEN,
    PieceType.ROOK,
    PieceType.BISHOP
  ].includes(piece.type))

  const trajectoryBuilder = (start: PiecePosition, direction: TrajectoryDirection): PiecePosition[] => {
    const trajectory = buildTrajectory({ start: start, direction: direction, color: opponentsColor, squares: squares })
    return [ start ].concat(trajectory.slice(0, trajectory.length))
  }

  const trajectory: PiecePosition[] = []

  for (let piece of opponentsPieces) {
    const moves = buildPossibleMovements(piece, squares, false, false)
    
    if (moves.has(allyKing.position)) {
      const [ y0, x0 ] = getCoordFromPosition(piece.position)

      // Horizontal
      if (y0 === y1) {
        // East
        if (x0 < x1) {
          return trajectoryBuilder(piece.position, TrajectoryDirection.EAST)
        }

        // West
        return trajectoryBuilder(piece.position, TrajectoryDirection.WEST)
      }

      // Vertical
      if (x0 === x1) {

        // South
        if (y0 < y1) {
          return trajectoryBuilder(piece.position, TrajectoryDirection.SOUTH)
        }

        // North
        return trajectoryBuilder(piece.position, TrajectoryDirection.NORTH)
      }


      // Diagonals

      // North-west
      if (x0 > x1 && y0 > y1) {
        return trajectoryBuilder(piece.position, TrajectoryDirection.NORTHWEST)
      }

      // South-east
      if (x0 < x1 && y0 < y1) {
        return trajectoryBuilder(piece.position, TrajectoryDirection.SOUTHEAST)
      }

      // South-west
      if (x0 > x1 && y0 < y1) {
        return trajectoryBuilder(piece.position, TrajectoryDirection.SOUTHWEST)
      }

      // North-west
      if (x0 < x1 && y0 > y1) {
        return trajectoryBuilder(piece.position, TrajectoryDirection.NORTHEAST)
      }

    }
  }

  return trajectory
}

/**
 * Checks if it's check to side with color
 * @param color
 * @param squares
 */
export const isCheckTo = (color: PieceColor, squares: Squares): boolean => {
  // If anyone threatening the king
  return findThreatPosition(color, squares) !== null
}

/**
 * Checks if it's mate to side with color
 * @param color
 * @param king
 * @param threatTrajectory
 * @param squares
 */
export const isMateTo = (color: PieceColor, king: Square, threatTrajectory: PiecePosition[], squares: Squares): boolean => {
  const alliedPieces = getAlliedPieces(color, squares).filter(piece => piece.type !== PieceType.KING)
  let possibleMovements = new Set<PiecePosition>()
  let kingsPossibleMovements = buildPossibleMovements(king.piece, squares)
  kingsPossibleMovements = filterKingsMoves(kingsPossibleMovements, color, squares)

  // Allied pieces possible moves
  for (let piece of alliedPieces) {
    [ ...buildPossibleMovements(piece, squares) ].forEach((move) => possibleMovements.add(move))
  }

  return [
    // No one can beat threatening piece or block from threat
    !threatTrajectory.some((pos) => possibleMovements.has(pos)),
    // King cannot escape (every cell can be beaten + castle cell)
    kingsPossibleMovements.size === 0
  ].every(condition => condition)
}
