import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk, RootState } from "../../app/store"
import { processGameState, selectPossibleMovements, setPossibleMovements } from "../board/boardSlice"
import { historySnapshot, traverseInTime } from "../history/historySlice"
import { ModifyType, Movement, Piece, PiecePosition, PlacePiece } from "./types"
import {
  castlingDirections,
  filterKingsMoves,
  getAlliedRooksUnmoved,
  getCoordFromPosition,
  getPositionFromCoords,
  rookReadyForCastle
} from "./utils"
import { getHistoryItemName } from "../history/utils"
import { PieceType } from "./enums"
import {
  BOARD_LAST_SQUARE,
  BOARD_START_SQUARE,
  CASTLING_LEFT_KING_POS,
  CASTLING_LEFT_ROOK_POS,
  CASTLING_RIGHT_KING_POS
} from "../board/constants"
import { buildPossibleMovements } from "../board/utils"
import { MovementType } from "../board/enums"
import { PossibleMovements } from "../board/types"

const initialState = {
  current: {} as Piece
}

const pieceSlice = createSlice({
  name: "piece",
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Piece>) => {
      state.current = action.payload
    },
    clearCurrent: (state) => {
      state.current = {} as Piece
    }
  },
  extraReducers: (builder => {
    builder.addCase(dropPiece, (state) => {
      state.current = {} as Piece
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.piece
    })
  })
})

export const dropPiece = createAction<void>("piece/drop")
export const placePiece = createAction<PlacePiece>("piece/place")
export const modifyPieceType = createAction<ModifyType>("piece/modify-type")
export const movePieceFromTo = createAction<Movement>("piece/move-from-to")

/**
 * Handles piece drag
 */
export const dragHandler = (dragPiece: Piece): AppThunk => (dispatch, getState) => {
  const boardState = getState().board
  const { color } = dragPiece
  const checkState = getState().game.check
  const isCheckToMyKing = checkState?.to === color
  const { squares } = boardState
  const boardPossibleMovements: PossibleMovements = {}

  dispatch(setCurrent(dragPiece))

  // If piece is no longer at the start position
  if (!dragPiece) return

  let possibleMovements = buildPossibleMovements(dragPiece, squares)

  // If dragging king
  if (dragPiece.type === PieceType.KING) {
    possibleMovements = filterKingsMoves(possibleMovements, color, squares)
  }

  // If check to my king, and dragging any piece but king
  if (isCheckToMyKing && dragPiece.type !== PieceType.KING) {
    // Allow only protective moves
    for (let pos of possibleMovements) {
      if (!checkState!.trajectory!.includes(pos)) {
        possibleMovements.delete(pos)
      }
    }
  }

  // Build possible movements
  for (let pos of possibleMovements) {
    boardPossibleMovements[pos] = MovementType.REGULAR
  }

  // Castling
  if (dragPiece.type === PieceType.KING) {
    const kingCastlingDirections = castlingDirections(dragPiece, squares)

    // If castling directions available
    if (kingCastlingDirections.some(d => d)) {
      // Check allied rooks
      for (let rook of getAlliedRooksUnmoved(dragPiece, squares)) {
        if (rookReadyForCastle(rook, squares)) {
          const [ rank, file ] = getCoordFromPosition(rook.position)
          if (file === BOARD_START_SQUARE && !kingCastlingDirections[BOARD_START_SQUARE]) continue
          if (file === CASTLING_LEFT_ROOK_POS && !kingCastlingDirections[1]) continue
          const availableFile = file === BOARD_START_SQUARE ? getPositionFromCoords(rank, CASTLING_LEFT_KING_POS) : getPositionFromCoords(rank, CASTLING_RIGHT_KING_POS)

          boardPossibleMovements[availableFile] = MovementType.CASTLE
        }
      }
    }
  }

  dispatch(setPossibleMovements(boardPossibleMovements))
}

/**
 * Process pawn to queen transition
 */
const processPawnToQueen = (): AppThunk => (dispatch, getState) => {
  const piece = selectCurrentPiece(getState())
  const { type, position } = piece
  const [ rank ] = getCoordFromPosition(position)

  // Only for pawns
  if (type !== PieceType.PAWN) return
  if ([ BOARD_START_SQUARE, BOARD_LAST_SQUARE ].includes(rank)) {
    dispatch(modifyPieceType({ piece, newType: PieceType.QUEEN }))
  }
}

/**
 * Moving piece to square
 * @param to
 */
export const movePieceTo = (to: PiecePosition): AppThunk => (dispatch, getState) => {
  const getCurrent = () => selectCurrentPiece(getState())
  const current = selectCurrentPiece(getState())
  const movementType = selectPossibleMovements(getState())[to]

  dispatch(pieceSlice.actions.setCurrent({ ...current, position: to }))
  dispatch(movePieceFromTo({ from: current.position as PiecePosition, to, piece: getCurrent(), type: movementType }))
  dispatch(processPawnToQueen())
  dispatch(processGameState())
  dispatch(historySnapshot(getHistoryItemName(current.position, to, movementType)))
}

export const { setCurrent } = pieceSlice.actions

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
