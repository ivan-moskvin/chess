import { AppThunk } from "./store";
import { placePiece } from "../features/piece/pieceSlice";
import { PieceColor, PieceType } from "../features/piece/enums";

export const initPiecesCheck = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "H5", type: PieceType.QUEEN, color: PieceColor.WHITE }))

  dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
}

export const initPiecesPreCheck = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "H4", type: PieceType.QUEEN, color: PieceColor.WHITE }))

  dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
}

export const initPiecesMate = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "A8", type: PieceType.KING, color: PieceColor.BLACK }))

  dispatch(placePiece({ position: "H1", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "B1", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "H7", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
}

export const initPiecesDraw = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "A8", type: PieceType.KING, color: PieceColor.WHITE }))

  dispatch(placePiece({ position: "H3", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "F3", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "G1", type: PieceType.KING, color: PieceColor.BLACK }))
}

export const initPiecesTestingPatterns = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "A8", type: PieceType.KING, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "G2", type: PieceType.KING, color: PieceColor.WHITE }))


  dispatch(placePiece({ position: "B2", type: PieceType.QUEEN, color: PieceColor.WHITE }))
  dispatch(placePiece({ position: "E3", type: PieceType.BISHOP, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "G5", type: PieceType.KNIGHT, color: PieceColor.BLACK }))

  dispatch(placePiece({ position: "E5", type: PieceType.KNIGHT, color: PieceColor.WHITE }))

}