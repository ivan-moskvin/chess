import { Piece, PiecePosition } from "./types";
import { AppThunk } from "../../app/store";
import { PossibleMovements } from "../board/types";
import { buildPossibleMovements } from "../board/utils";
import { PieceType } from "./enums";
import {
  castlingDirections,
  filterKingsMoves,
  getAlliedRooksUnmoved,
  getCoordFromPosition,
  getPositionFromCoords,
  rookReadyForCastle
} from "./utils";
import { MovementType } from "../board/enums";
import {
  BOARD_LAST_SQUARE,
  BOARD_START_SQUARE,
  CASTLING_LEFT_KING_POS,
  CASTLING_LEFT_ROOK_POS,
  CASTLING_RIGHT_KING_POS
} from "../board/constants";
import { selectPossibleMovements, setPossibleMovements } from "../board/boardSlice";
import { historySnapshot } from "../history/thunks";
import { getHistoryItemName } from "../history/utils";
import { processGameState } from "../board/thunks";
import { modifyPieceType, movePiece, selectCurrentPiece, setCurrent } from "./pieceSlice";

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
  
  if (!piece?.position) return

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
  const current = selectCurrentPiece(getState())

  dispatch(setCurrent({ ...current, position: to }))
  dispatch(movePieceFromTo(current.position, to))

}

/**
 * Moves piece from to
 * @param from
 * @param to
 */
export const movePieceFromTo = (from: PiecePosition, to: PiecePosition): AppThunk => (dispatch, getState) => {
  const movementType = selectPossibleMovements(getState())[to]

  dispatch(movePiece({ from, to, type: movementType }))
  dispatch(historySnapshot(getHistoryItemName(from, to, movementType)))
  dispatch(processPawnToQueen())
  dispatch(processGameState())
}