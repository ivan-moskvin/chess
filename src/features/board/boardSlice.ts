import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ISquare, SquareColor } from "../square/squareSlice"
import { AppThunk, RootState } from "../../app/store"
import {
  canIMoveOrBeat,
  dragPiece,
  dropPiece,
  getCoordFromPosition,
  IPiece,
  isSquareCanBeBeaten,
  movePieceFromTo,
  PieceColor,
  PiecePosition,
  PieceType,
  placePiece
} from "../piece/pieceSlice"
import { checkTo, clearCheck, mateTo } from "../game/gameSlice"

interface Board {
  squares: ISquare[][],
  activeSquare: string,
  possibleMovements: { [key: PiecePosition]: null },
}

enum ThreatDirection {
  NORTH,
  NORTH_EAST,
  EAST,
  SOUTH_EAST,
  SOUTH,
  SOUTH_WEST,
  WEST,
  NORTH_WEST
}

/**
 * Find square by position
 * @param position
 * @param squares
 */
const findSquare = (position: PiecePosition, squares: ISquare[][]): ISquare => {
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
const findKingsSquareByColor = (color: PieceColor, squares: ISquare[][]): ISquare => {
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
const kingCanEscape = (kingSquare: ISquare, squares: ISquare[][]): boolean => {
  const [y, x] = kingSquare.coords
  const positions = [
    [y - 1, x - 1],
    [y - 1, x],
    [y - 1, x + 1],
    [y, x - 1],
    [y, x + 1],
    [y + 1, x - 1],
    [y + 1, x],
    [y + 1, x + 1],
  ].filter(([y, x]) => !!squares[y] && squares[y][x])

  return positions
    .some(([y, x]) => {
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
 */
export const haveObstaclesBetween = (y0: number, x0: number, y1: number, x1: number, squares: ISquare[][]): boolean => {
  if (y0 === y1 && x0 === x1) return false

  // If it's horizontal move
  if (y0 === y1) {
    // Check all vertical pieces in between start and end
    for (let i = Math.min(x0, x1) + 1; i < Math.max(x0, x1); i++) {
      if (!!squares[y0][i].piece?.type) return true
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
        if (!!squares[i][j].piece?.type) return true
      }
    }

    // Check south-west and north-east
    if ((x1 < x0 && y1 > y0) || (x1 > x0 && y1 < y0)) {
      for (let i = Math.max(y0, y1) - 1, j = Math.min(x0, x1) + 1; i > Math.min(y0, y1) && j < Math.max(x0, x1); i--, j++) {
        if (!!squares[i][j].piece?.type) return true
      }
    }
  }

  return false
}

/**
 * Gets threat direaction
 * @param y0
 * @param x0
 * @param y0
 * @param y1
 * @param x1
 */
const getThreatDirection = (y0: number, x0: number, y1: number, x1: number): ThreatDirection => {
  /**
   * Do threat detection
   */
  return ThreatDirection.NORTH
}

/**
 * Checks if someone can protect king
 */
const someoneCanProtectKing = (kingSquare: ISquare, from: ISquare): boolean => {
  // Someone can go to any cell between king and threat
  const [y1, x1] = getCoordFromPosition(kingSquare.position)
  const [y0, x0] = getCoordFromPosition(from.position)


  switch (getThreatDirection(y0, x0, y1, x1)) {
    case ThreatDirection.NORTH:
    case ThreatDirection.NORTH_EAST:
    case ThreatDirection.EAST:
    case ThreatDirection.SOUTH_EAST:
    case ThreatDirection.SOUTH:
    case ThreatDirection.SOUTH_WEST:
    case ThreatDirection.WEST:
    case ThreatDirection.NORTH_WEST:

  }

  return false
}

/**
 * Processes check/mate situation
 */
export const processCheckMate = (): AppThunk => (dispatch, getState) => {
  const { board: { squares }, piece: { current } } = getState()
  const currentSquare = findSquare(current.position, squares)

  const opponentsKing = findKingsSquareByColor(
    current.color! === PieceColor.BLACK
      ? PieceColor.WHITE
      : PieceColor.BLACK,
    squares
  )

  const opponentsColor = opponentsKing.piece!.color

  if (isCheck()) {
    dispatch(checkTo(opponentsColor))

    if (isMate()) {
      return dispatch(mateTo(opponentsColor))
    }

    return
  }

  return dispatch(clearCheck())

  function isCheck(): boolean {
    // If anyone threatening the king
    return canIMoveOrBeat(current, opponentsKing.position, squares)
  }

  function isMate(): boolean {
    return [
      // No one can beat threatening piece
      !isSquareCanBeBeaten(currentSquare, current.position, opponentsColor, squares),
      // King cannot escape (every cell can be beaten + castle cell)
      !kingCanEscape(opponentsKing, squares),
      // No one can body block king from threat
      !someoneCanProtectKing(opponentsKing, currentSquare)
    ].every(condition => condition)
  }
}

const boardSlice = createSlice({
  name: "field",
  initialState: {
    squares: [],
    activeSquare: "",
    possibleMovements: {}
  } as Board,
  reducers: {
    initSquares: (state: Board) => {
      const squares =
        new Array(8)
          .fill(null)
          .map(() =>
            new Array(8)
              .fill(null)
              .map(() => ({} as ISquare)))

      const n = squares.length
      const m = squares[0].length

      for (let i = 0, rowCount = 8; i < n; i++, rowCount--) {
        const isEvenRow = i % 2 === 0

        for (let j = 0, charCode = 97; j < m; j++, charCode++) {
          const name = String.fromCharCode(charCode).toUpperCase() + rowCount
          if (!isEvenRow) {
            squares[i][j].color = j % 2 === 0 ? SquareColor.BLACK : SquareColor.WHITE
          } else {
            squares[i][j].color = j % 2 === 0 ? SquareColor.WHITE : SquareColor.BLACK
          }

          // Set square's params
          squares[i][j] = {
            ...squares[i][j],
            position: name,
            coords: [i, j]
          }
        }
      }

      state.squares = squares
    },
  }, extraReducers: (builder) => {
    builder.addCase(placePiece, (state, action) => {
      const { position, type, color } = action.payload
      const [rank, file] = getCoordFromPosition(position)

      state.squares[rank][file].piece = {
        type,
        color,
        position: position.toUpperCase(),
      }
    })
    builder
      .addCase(dragPiece, (state, action: PayloadAction<IPiece>) => {
        const { squares } = state
        const { position } = action.payload
        const square = findSquare(position, squares)

        // If piece is no longer at the start position
        if (!square.piece) return

        state.activeSquare = position

        for (let i = 0; i < squares.length; i++) {
          for (let j = 0; j < squares[0].length; j++) {
            if (canIMoveOrBeat(square.piece!, squares[i][j].position, squares)) {
              state.possibleMovements[squares[i][j].position] = null
            }
          }
        }
      })
    // Clear active square and possible movements
    builder.addCase(dropPiece, (state) => {
      state.activeSquare = ""
      state.possibleMovements = {}
    })
    // Make move
    builder.addCase(movePieceFromTo, (state, action) => {
      const { from, to, piece } = action.payload

      const [rankFrom, fileFrom] = getCoordFromPosition(from)
      const [rankTo, fileTo] = getCoordFromPosition(to)

      delete state.squares[rankFrom][fileFrom].piece
      state.squares[rankTo][fileTo].piece = piece
    })
  }
})

export const initPieces =
  (): AppThunk =>
    (dispatch) => {
      // Place pawns
      for (let i = 0, charCode = 97; i < 8; i++, charCode++) {
        dispatch(placePiece({
          position: String.fromCharCode(charCode) + "2",
          type: PieceType.PAWN,
          color: PieceColor.WHITE
        }))
        dispatch(placePiece({
          position: String.fromCharCode(charCode) + "7",
          type: PieceType.PAWN,
          color: PieceColor.BLACK
        }))
      }

      // Place rooks
      dispatch(placePiece({ position: "A8", type: PieceType.ROOK, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "H8", type: PieceType.ROOK, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "A1", type: PieceType.ROOK, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "H1", type: PieceType.ROOK, color: PieceColor.WHITE }))

      // Place knights
      dispatch(placePiece({ position: "B8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "G8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "B1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "G1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))

      // Place bishops
      dispatch(placePiece({ position: "C8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "F8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "C1", type: PieceType.BISHOP, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "F1", type: PieceType.BISHOP, color: PieceColor.WHITE }))

      // Place queens
      dispatch(placePiece({ position: "D8", type: PieceType.QUEEN, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "D1", type: PieceType.QUEEN, color: PieceColor.WHITE }))

      // Place kings
      dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
    }
export const { initSquares } = boardSlice.actions

export const selectSquares = (state: RootState) => state.board.squares
export const selectActiveSquare = (state: RootState) => state.board.activeSquare
export const selectPossibleMovements = (state: RootState) => state.board.possibleMovements

export default boardSlice.reducer
