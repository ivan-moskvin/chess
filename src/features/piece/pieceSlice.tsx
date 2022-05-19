import { createAction, createSlice } from "@reduxjs/toolkit"
import { AppThunk, RootState } from "../../app/store"
import { processGameState } from "../board/boardSlice"
import { getHistoryItemName, historySnapshot, traverseInTime } from "../history/historySlice"
import { IPiece, ModifyType, Movement, PiecePosition } from "./types"
import { getCoordFromPosition } from "./utils"

export enum PieceType {
  KING = "King",
  QUEEN = "Queen",
  ROOK = "Rook",
  BISHOP = "Bishop",
  KNIGHT = "Knight",
  PAWN = "Pawn"
}

export enum PieceColor {
  BLACK = "Black",
  WHITE = "White"
}

const pieceSlice = createSlice({
  name: "piece",
  initialState: {
    current: {} as IPiece
  },
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload
    }
  },
  extraReducers: (builder => {
    builder.addCase(dragPiece, (state, action) => {
      state.current = action.payload
    })
    builder.addCase(dropPiece, (state) => {
      state.current = {} as IPiece
    })
    builder.addCase(traverseInTime, (state, action) => {
      return action.payload.piece
    })
  })
})

export const dragPiece = createAction<IPiece>("piece/drag")
export const dropPiece = createAction<void>("piece/drop")
export const placePiece = createAction<IPiece>("piece/place")
export const modifyPieceType = createAction<ModifyType>("piece/modify-type")
export const movePieceFromTo = createAction<Movement>("piece/move-from-to")


/**
 * Process pawn to queen transition
 */
const processPawnToQueen = (): AppThunk => (dispatch, getState) => {
  const { piece } = getState()
  const { current: { type, position } } = piece
  const [ rank ] = getCoordFromPosition(position)

  // Only for pawns
  if (type !== PieceType.PAWN) return
  if ([ 0, 7 ].includes(rank)) {
    dispatch(modifyPieceType({ piece: piece.current, newType: PieceType.QUEEN }))
  }
}

/**
 * Moving piece to square
 * @param to
 */
export const movePieceTo = (to: PiecePosition): AppThunk => (dispatch, getState) => {
  const getCurrent = () => getState().piece.current
  const current = getCurrent()

  dispatch(pieceSlice.actions.setCurrent({ ...current, position: to }))
  dispatch(movePieceFromTo({ from: current.position as PiecePosition, to, piece: getCurrent() }))
  dispatch(processGameState())
  dispatch(processPawnToQueen())
  dispatch(historySnapshot(getHistoryItemName(current.position, to)))
}

export const selectCurrentPiece = (state: RootState) => state.piece.current

export default pieceSlice.reducer
