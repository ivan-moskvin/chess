import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SquareColor } from "../square/enums"
import { RootState } from "../../app/store"
import { dropPiece, modifyPieceType, movePiece, placePiece } from "../piece/pieceSlice"
import { checkTo, clearCheck } from "../game/gameSlice"
import { traverseInTime } from "../history/historySlice"
import { Square, Squares } from "../square/types"
import { Board, PieceMap, PossibleMovements } from "./types"
import { findKingsSquareByColor, getPieceByPosition } from "./utils"
import { getCoordFromPosition, getPieceMapName, getPositionFromCoords } from "../piece/utils"
import { MovementType } from "./enums"
import {
  BOARD_LAST_SQUARE,
  BOARD_SIZE,
  BOARD_START_SQUARE,
  CASTLING_LEFT_KING_POS,
  CASTLING_LEFT_ROOK_POS,
  CASTLING_RIGHT_ROOK_POS
} from "./constants"
import { CHAR_A_CODE } from "../../app/constants"
import { Check } from "../game/types"

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
    builder.addCase(movePiece, (state, action) => {
      // Clear active square and possible movements
      state.possibleMovements = {}

      const { from, to, type } = action.payload
      const piece = getPieceByPosition(from, state.squares)

      const [ rankFrom, fileFrom ] = getCoordFromPosition(from)
      const [ rankTo, fileTo ] = getCoordFromPosition(to)

      const mapPiece = state.pieceMap[getPieceMapName(piece!)]
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
      if (!kingSquare?.piece) return
      kingSquare.piece.underCheck = false
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.board
    })
  }
})


export const { initSquares, setPossibleMovements } = boardSlice.actions

export const selectSquares = (state: RootState): Squares => state.board.squares
export const selectPossibleMovements = (state: RootState): PossibleMovements => state.board.possibleMovements
export const selectPieceMap = (state: RootState): PieceMap => state.board.pieceMap

export default boardSlice.reducer
