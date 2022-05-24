import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SquareColor } from "../square/enums"
import { AppThunk, RootState } from "../../app/store"
import { dragPiece, dropPiece, modifyPieceType, movePieceFromTo, placePiece } from "../piece/pieceSlice"
import { checkTo, clearCheck, draw, mateTo } from "../game/gameSlice"
import { traverseInTime } from "../history/historySlice"
import { Piece, PiecePosition } from "../piece/types"
import { Square, Squares } from "../square/types"
import { Board, PieceMap, PossibleMovements } from "./types"
import {
  buildPossibleMovements,
  findKingsSquareByColor,
  findSquare,
  getAlliedPieces,
  getOpponentsColor,
  getOpponentsPieces,
  kingCanEscape,
  someoneCanProtectKing
} from "./utils"
import {
  canIMoveOrBeat,
  castlingDirections,
  getAlliedRooksUnmoved,
  getCoordFromPosition,
  getPieceMapName,
  getPositionFromCoords,
  isSquareCanBeBeaten,
  rookReadyForCastle
} from "../piece/utils"
import { MovementType } from "./enums"
import { PieceColor, PieceType } from "../piece/enums"
import {
  BOARD_LAST_SQUARE,
  BOARD_SIZE,
  BOARD_START_SQUARE,
  CASTLING_LEFT_KING_POS,
  CASTLING_LEFT_ROOK_POS,
  CASTLING_RIGHT_KING_POS,
  CASTLING_RIGHT_ROOK_POS
} from "./constants";
import { CHAR_A_CODE } from "../../app/constants";

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
    possibleMovements: {},
    pieceMap: {}
  } as Board,
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
    builder
      .addCase(dragPiece, (state: Board, action: PayloadAction<Piece>) => {
        const { squares } = state
        const piece = action.payload
        const { position, color, coords: { rank, file } } = piece

        // If piece is no longer at the start position
        if (!piece) return

        state.activeSquare = position


        const possibleMovements = buildPossibleMovements(piece, squares)

        // If dragging king
        if (piece.type === PieceType.KING) {
          // Find enemy rooks, bishops, queens
          const threateningPieces = getOpponentsPieces(color, squares)
            .filter(({ type }) => [ PieceType.ROOK, PieceType.BISHOP, PieceType.QUEEN ].includes(type))

          // Build their trajectories
          const threateningMovements = threateningPieces.reduce<Set<PiecePosition>>((acc, cur) => {
            for (let pos of buildPossibleMovements(cur, squares)) {
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
        }

        // Build possible movements
        for (let pos of possibleMovements) {
          state.possibleMovements[pos] = MovementType.REGULAR
        }

        // Castling
        if (piece.type === PieceType.KING) {
          const kingCastlingDirections = castlingDirections(piece, squares)

          // If no castling directions available
          if (kingCastlingDirections.every(d => !d)) return

          // Check allied rooks
          for (let rook of getAlliedRooksUnmoved(piece, squares)) {
            if (rookReadyForCastle(rook, squares)) {
              const [ rank, file ] = getCoordFromPosition(rook.position)
              if (file === BOARD_START_SQUARE && !kingCastlingDirections[BOARD_START_SQUARE]) continue
              if (file === CASTLING_LEFT_ROOK_POS && !kingCastlingDirections[1]) continue
              const availableFile = file === BOARD_START_SQUARE ? getPositionFromCoords(rank, CASTLING_LEFT_KING_POS) : getPositionFromCoords(rank, CASTLING_RIGHT_KING_POS)

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
    (dispatch, getState) => {
      // Place pawns
      // for (let i = 0, charCode = 97; i < 8; i++, charCode++) {
      //   dispatch(placePiece({
      //     position: String.fromCharCode(charCode) + "2",
      //     type: PieceType.PAWN,
      //     color: PieceColor.WHITE
      //   }))
      //   dispatch(placePiece({
      //     position: String.fromCharCode(charCode) + "7",
      //     type: PieceType.PAWN,
      //     color: PieceColor.BLACK
      //   }))
      // }
      //
      // // Place rooks
      // dispatch(placePiece({ position: "A8", type: PieceType.ROOK, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "H8", type: PieceType.ROOK, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "A1", type: PieceType.ROOK, color: PieceColor.WHITE }))
      // dispatch(placePiece({ position: "H1", type: PieceType.ROOK, color: PieceColor.WHITE }))
      //
      // // Place knights
      // dispatch(placePiece({ position: "B8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "G8", type: PieceType.KNIGHT, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "B1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))
      // dispatch(placePiece({ position: "G1", type: PieceType.KNIGHT, color: PieceColor.WHITE }))
      //
      // // Place bishops
      // dispatch(placePiece({ position: "C8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "F8", type: PieceType.BISHOP, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "C1", type: PieceType.BISHOP, color: PieceColor.WHITE }))
      // dispatch(placePiece({ position: "F1", type: PieceType.BISHOP, color: PieceColor.WHITE }))
      //
      // // Place queens
      // dispatch(placePiece({ position: "B4", type: PieceType.QUEEN, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "D1", type: PieceType.QUEEN, color: PieceColor.WHITE }))
      //
      // // Place kings
      // dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
      // dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))

      dispatch(placePiece({
        position: "D2",
        type: PieceType.PAWN,
        color: PieceColor.WHITE
      }))
      dispatch(placePiece({
        position: "E2",
        type: PieceType.PAWN,
        color: PieceColor.WHITE
      }))


      dispatch(placePiece({ position: "F6", type: PieceType.ROOK, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "C4", type: PieceType.QUEEN, color: PieceColor.WHITE }))
      dispatch(placePiece({ position: "B4", type: PieceType.QUEEN, color: PieceColor.BLACK }))

    }
export const { initSquares } = boardSlice.actions

export const selectSquares = (state: RootState): Squares => state.board.squares
export const selectActiveSquare = (state: RootState): string => state.board.activeSquare
export const selectPossibleMovements = (state: RootState): PossibleMovements => state.board.possibleMovements
export const selectPieceMap = (state: RootState): PieceMap => state.board.pieceMap

export default boardSlice.reducer
