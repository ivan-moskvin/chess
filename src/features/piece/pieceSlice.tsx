import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk, RootState } from "../../app/store"
import { processGameState, selectPossibleMovements } from "../board/boardSlice"
import { historySnapshot, traverseInTime } from "../history/historySlice"
import { ModifyType, Movement, Piece, PiecePosition, PlacePiece } from "./types"
import { getCoordFromPosition } from "./utils"
import { getHistoryItemName } from "../history/utils";
import { PieceType } from "./enums";
import { BOARD_LAST_SQUARE, BOARD_START_SQUARE } from "../board/constants";

const pieceSlice = createSlice({
  name: "piece",
  initialState: {
    current: {} as Piece
  },
  reducers: {
    setCurrent: (state, action: PayloadAction<Piece>) => {
      state.current = action.payload
    }
  },
  extraReducers: (builder => {
    builder.addCase(dragPiece, (state, action) => {
      state.current = action.payload
    })
    builder.addCase(dropPiece, (state) => {
      state.current = {} as Piece
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.piece
    })
  })
})

export const dragPiece = createAction<Piece>("piece/drag")
export const dropPiece = createAction<void>("piece/drop")
export const placePiece = createAction<PlacePiece>("piece/place")
export const modifyPieceType = createAction<ModifyType>("piece/modify-type")
export const movePieceFromTo = createAction<Movement>("piece/move-from-to")


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
  dispatch(processGameState())
  dispatch(processPawnToQueen())
  dispatch(historySnapshot(getHistoryItemName(current.position, to, movementType)))
}

export const { setCurrent } = pieceSlice.actions

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
