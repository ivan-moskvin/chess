import { AppThunk } from "../../app/store";
import {
  buildThreatTrajectory,
  findKingsSquareByColor,
  findThreatPosition,
  getOpponentsColor,
  isCheckTo,
  isDraw,
  isMateTo
} from "./utils";
import { error } from "../notify/utils";
import { LANG } from "../../i18n/i18n";
import { checkTo, clearCheck, draw, hideThreat, mateTo, setThreatTrajectory, showThreat } from "../game/gameSlice";
import { THREAT_SHOW_TIME } from "./constants";
import { placePiece } from "../piece/pieceSlice";
import { PieceColor, PieceType } from "../piece/enums";
import { back } from "../history/thunks";

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