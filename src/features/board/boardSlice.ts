import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SquareColor } from "../square/enums"
import { AppThunk, RootState } from "../../app/store"
import { dropPiece, modifyPieceType, movePieceFromTo, placePiece } from "../piece/pieceSlice"
import { checkTo, clearCheck, draw, hideThreat, mateTo, setThreatTrajectory, showThreat } from "../game/gameSlice"
import { back, traverseInTime } from "../history/historySlice"
import { Square, Squares } from "../square/types"
import { Board, PieceMap, PossibleMovements } from "./types"
import {
  buildThreatTrajectory,
  findKingsSquareByColor,
  findThreatPosition,
  getOpponentsColor,
  isCheckTo,
  isDraw,
  isMateTo
} from "./utils"
import { getCoordFromPosition, getPieceMapName, getPositionFromCoords } from "../piece/utils"
import { MovementType } from "./enums"
import { PieceColor, PieceType } from "../piece/enums"
import {
  BOARD_LAST_SQUARE,
  BOARD_SIZE,
  BOARD_START_SQUARE,
  CASTLING_LEFT_KING_POS,
  CASTLING_LEFT_ROOK_POS,
  CASTLING_RIGHT_ROOK_POS,
  THREAT_SHOW_TIME
} from "./constants"
import { CHAR_A_CODE } from "../../app/constants"
import { Check } from "../game/types"
import { error } from "../notify/utils"
import { LANG } from "../../i18n/i18n"

const initialState: Board = {
  squares: [],
  possibleMovements: {},
  pieceMap: {}
}

const boardSlice = createSlice({
  name: "field",
  initialState,
  reducers: {
    initSquares: (state: Board) => {
      const squares =
        new Array(BOARD_SIZE)
          .fill(null)
          .map(() =>
            new Array(BOARD_SIZE)
              .fill(null)
              .map(() => ({} as Square)))

      const n = squares.length
      const m = squares[0].length

      for (let i = BOARD_START_SQUARE, rowCount = BOARD_SIZE; i < n; i++, rowCount--) {
        const isEvenRow = i % 2 === 0

        for (let j = BOARD_START_SQUARE, charCode = CHAR_A_CODE; j < m; j++, charCode++) {
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
    setPossibleMovements: (state, action: PayloadAction<PossibleMovements>) => {
      state.possibleMovements = action.payload
    }
  }, extraReducers: (builder) => {
    builder.addCase(placePiece, (state, action) => {
      const { position, type, color } = action.payload
      const [ rank, file ] = getCoordFromPosition(position)

      const piece = {
        type,
        color,
        position: position.toUpperCase(),
        moved: false,
        coords: { rank, file }
      }

      state.pieceMap[getPieceMapName(piece)] = piece
      state.squares[rank][file].piece = piece
    })
    builder.addCase(modifyPieceType, (state, action) => {
      const { newType, piece } = action.payload
      const { position } = piece
      const [ rank, file ] = getCoordFromPosition(position)
      const mapPiece = state.pieceMap[getPieceMapName(piece)]

      mapPiece.type = newType

      state.squares[rank][file].piece = mapPiece
      state.pieceMap[getPieceMapName(mapPiece)] = mapPiece
    })
    // Clear active square and possible movements
    builder.addCase(dropPiece, (state) => {
      state.possibleMovements = {}
    })
    // Make move
    builder.addCase(movePieceFromTo, (state, action) => {
      // Clear active square and possible movements
      state.possibleMovements = {}

      const { from, to, piece, type } = action.payload

      const [ rankFrom, fileFrom ] = getCoordFromPosition(from)
      const [ rankTo, fileTo ] = getCoordFromPosition(to)

      const mapPiece = state.pieceMap[getPieceMapName(piece)]
      mapPiece.moved = true
      mapPiece.coords = { rank: rankTo, file: fileTo }
      mapPiece.position = getPositionFromCoords(rankTo, fileTo)

      delete state.squares[rankFrom][fileFrom].piece
      state.squares[rankTo][fileTo].piece = mapPiece

      // Castling
      if (type === MovementType.CASTLE) {
        const rook = state.squares[rankTo][fileTo === CASTLING_LEFT_KING_POS ? BOARD_START_SQUARE : BOARD_LAST_SQUARE].piece
        const mapRook = state.pieceMap[getPieceMapName(rook)]

        if (fileTo === CASTLING_LEFT_KING_POS) {
          mapRook.moved = true
          mapRook.coords = { rank: rankTo, file: CASTLING_LEFT_ROOK_POS }
          mapRook.position = getPositionFromCoords(rankTo, CASTLING_LEFT_ROOK_POS)

          delete state.squares[rankTo][BOARD_START_SQUARE].piece
          state.squares[rankTo][CASTLING_LEFT_ROOK_POS].piece = mapRook

          return
        }

        mapRook.moved = true
        mapRook.coords = { rank: rankTo, file: CASTLING_RIGHT_ROOK_POS }
        mapRook.position = getPositionFromCoords(rankTo, CASTLING_RIGHT_ROOK_POS)

        delete state.squares[rankTo][BOARD_LAST_SQUARE].piece
        state.squares[rankTo][CASTLING_RIGHT_ROOK_POS].piece = mapRook

        return

      }
    })
    builder.addCase(checkTo, (state, action: PayloadAction<Check>) => {
      const kingSquare = findKingsSquareByColor(action.payload.to, state.squares)
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


/**
 * Processes check/mate situation
 */
export const processGameState = (): AppThunk => (dispatch, getState) => {
  const { board: { squares }, piece: { current } } = getState()
  const opponentsColor = getOpponentsColor(current.color)
  const opponentsKingsSquare = findKingsSquareByColor(opponentsColor, squares)
  const threatPositionToMyKing = findThreatPosition(current.color, squares)

  // If my turn causes check to my king, travel back in time
  if (threatPositionToMyKing) {

    // Rollback move
    dispatch(back())

    // Show error
    error(LANG.DISPOSING_KING_TO_THREAT)

    // Highlight threat
    dispatch(showThreat(threatPositionToMyKing))

    // Hide threat
    setTimeout(() => {
      dispatch(hideThreat())
    }, THREAT_SHOW_TIME)
  }

  if (isCheckTo(opponentsColor, squares)) {
    const threatTrajectory = buildThreatTrajectory(opponentsColor, squares)
    dispatch(checkTo({ to: opponentsColor }))
    dispatch(setThreatTrajectory(threatTrajectory))

    if (isMateTo(opponentsColor, opponentsKingsSquare, threatTrajectory, squares)) {
      return dispatch(mateTo(opponentsColor))
    }

    return
  }

  if (isDraw(opponentsColor, opponentsKingsSquare, squares)) return dispatch(draw())

  return dispatch(clearCheck(current.color))
}

export const { initSquares, setPossibleMovements } = boardSlice.actions

export const selectSquares = (state: RootState): Squares => state.board.squares
export const selectPossibleMovements = (state: RootState): PossibleMovements => state.board.possibleMovements
export const selectPieceMap = (state: RootState): PieceMap => state.board.pieceMap

export default boardSlice.reducer
