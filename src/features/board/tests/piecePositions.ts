import { AppThunk } from "../../../app/store";
import { placePiece } from "../../piece/pieceSlice";
import { PieceColor, PieceType } from "../../piece/enums";

export const initPiecesCheck = (): AppThunk => (dispatch) => {
  dispatch(placePiece({ position: "H5", type: PieceType.QUEEN, color: PieceColor.WHITE }))

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
  dispatch(placePiece({ position: "A8", type: PieceType.KING, color: PieceColor.BLACK }))

  dispatch(placePiece({ position: "H3", type: PieceType.QUEEN, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "F3", type: PieceType.QUEEN, color: PieceColor.BLACK }))
  dispatch(placePiece({ position: "G1", type: PieceType.KING, color: PieceColor.WHITE }))
}