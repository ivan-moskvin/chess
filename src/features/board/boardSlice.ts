import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SquareColor } from "../square/squareSlice"
import { AppThunk, RootState } from "../../app/store"
import {
  dragPiece,
  dropPiece,
  modifyPieceType,
  movePieceFromTo,
  PieceColor,
  PieceType,
  placePiece
} from "../piece/pieceSlice"
import { checkTo, clearCheck, draw, mateTo } from "../game/gameSlice"
import { traverseInTime } from "../history/historySlice"
import { IPiece, PiecePosition } from "../piece/types"
import { ISquare, Squares } from "../square/types"
import { Board, PossibleMovements } from "./types"
import {
  findKingsSquareByColor,
  findSquare,
  getAlliedPieces,
  getOpponentsColor,
  kingCanEscape,
  someoneCanProtectKing
} from "./utils"
import {
  canIMoveOrBeat,
  canIMoveToProtect,
  castlingDirections,
  getAlliedRooksUnmoved,
  getCoordFromPosition,
  getPositionFromCoords,
  isSquareCanBeBeaten,
  rookReadyForCastle
} from "../piece/utils"
import { MovementType } from "./enums";

/**
 * Processes check/mate situation
 */
export const processGameState = (): AppThunk => (dispatch, getState) => {
  const { board: { squares }, piece: { current } } = getState()
  const currentSquare = findSquare(current.position, squares)
  const opponentsColor = getOpponentsColor(current.color)
  const opponentsKing = findKingsSquareByColor(opponentsColor, squares)

  if (isCheck()) {
    dispatch(checkTo(opponentsColor))

    if (isMate()) {
      return dispatch(mateTo(opponentsColor))
    }

    return
  }

  if (isDraw()) return dispatch(draw())

  return dispatch(clearCheck(current.color))

  function isDraw(): boolean {
    // If opponent has pieces besides king
    if (getAlliedPieces(opponentsColor, squares).length > 1) return false

    // If opponent's king has no place to go
    return !kingCanEscape(opponentsKing, squares)
  }

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
      !someoneCanProtectKing(opponentsKing, currentSquare, squares)
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
            coords: [ i, j ]
          }
        }
      }

      state.squares = squares
    },
  }, extraReducers: (builder) => {
    builder.addCase(placePiece, (state, action) => {
      const { position, type, color } = action.payload
      const [ rank, file ] = getCoordFromPosition(position)

      state.squares[rank][file].piece = {
        type,
        color,
        position: position.toUpperCase(),
        moved: false
      }
    })
    builder.addCase(modifyPieceType, (state, action) => {
      const { newType, piece: { position } } = action.payload
      const [ rank, file ] = getCoordFromPosition(position)

      state.squares[rank][file].piece!.type = newType
    })
    builder
      .addCase(dragPiece, (state: Board, action: PayloadAction<IPiece>) => {
        const { squares } = state
        const { position } = action.payload
        const square = findSquare(position, squares)

        // If piece is no longer at the start position
        if (!square.piece) return

        const { piece } = square

        state.activeSquare = position


        // Get possible movements
        for (let i = 0; i < squares.length; i++) {
          for (let j = 0; j < squares[0].length; j++) {
            if (canIMoveOrBeat(piece, squares[i][j].position, squares)
              || canIMoveToProtect(piece, squares[i][j].position, squares)) {
              const position: PiecePosition = squares[i][j].position
              state.possibleMovements[position] = MovementType.REGULAR
            }
          }
        }

        // Castling
        if (piece.type === PieceType.KING) {
          const kingCastlingDirections = castlingDirections(piece, squares);

          // If no castling directions available
          if (kingCastlingDirections.every(d => !d)) return

          // Check allied rooks
          for (let rook of getAlliedRooksUnmoved(piece, squares)) {
            if (rookReadyForCastle(rook, squares)) {
              const [ rank, file ] = getCoordFromPosition(rook.position)
              if (file === 0 && !kingCastlingDirections[0]) continue
              if (file === 7 && !kingCastlingDirections[1]) continue
              const availableFile = file === 0 ? getPositionFromCoords(rank, 2) : getPositionFromCoords(rank, 6)

              state.possibleMovements[availableFile] = MovementType.CASTLE
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
      // Clear active square and possible movements
      state.possibleMovements = {}
      state.activeSquare = ""

      const { from, to, piece, type } = action.payload

      const [ rankFrom, fileFrom ] = getCoordFromPosition(from)
      const [ rankTo, fileTo ] = getCoordFromPosition(to)

      delete state.squares[rankFrom][fileFrom].piece

      state.squares[rankTo][fileTo].piece = {
        ...piece,
        moved: true
      }

      if (type === MovementType.CASTLE) {
        const rook = state.squares[rankTo][fileTo === 2 ? 0 : 7].piece

        if (fileTo === 2) {
          delete state.squares[rankTo][0].piece
          state.squares[rankTo][3].piece = rook

          return
        }

        delete state.squares[rankTo][7].piece
        state.squares[rankTo][5].piece = rook

        return

      }
    })
    builder.addCase(checkTo, (state, action) => {
      const kingSquare = findKingsSquareByColor(action.payload, state.squares)
      kingSquare.piece.underCheck = true
    })
    builder.addCase(clearCheck, (state, action) => {
      const kingSquare = findKingsSquareByColor(action.payload, state.squares)
      kingSquare.piece.underCheck = false
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.board
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
      //
      // // Place knights
      dispatch(placePiece({ position: "B8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "G8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "B1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "G1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))
      //
      // // Place bishops
      dispatch(placePiece({ position: "C8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "F8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "C1", type: PieceType.BISHOP, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "F1", type: PieceType.BISHOP, color: PieceColor.WHITE }))
      //
      // // Place queens
      dispatch(placePiece({ position: "D8", type: PieceType.QUEEN, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "D1", type: PieceType.QUEEN, color: PieceColor.WHITE }))

      // Place kings
      dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
    }
export const { initSquares } = boardSlice.actions

export const selectSquares = (state: RootState): Squares => state.board.squares
export const selectActiveSquare = (state: RootState): string => state.board.activeSquare
export const selectPossibleMovements = (state: RootState): PossibleMovements => state.board.possibleMovements

export default boardSlice.reducer
