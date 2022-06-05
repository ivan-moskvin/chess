import { AppThunk } from "../../app/store";
import { initSquares } from "../board/boardSlice";
import { initPieces } from "../board/thunks";
import { resetGame } from "./gameSlice";
import { initHistory } from "../history/thunks";

/**
 * Starts new game
 */
export const newGame = (): AppThunk => (dispatch) => {
  dispatch(initHistory())
  dispatch(resetGame())
  dispatch(initSquares())
  dispatch(initPieces())
}