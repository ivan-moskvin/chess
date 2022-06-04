import { initSquares } from "../../board/boardSlice";
import { initPiecesCheck, initPiecesDraw, initPiecesMate } from "../../../app/piecePositions";
import { initPieces, processGameState } from "../../board/thunks";
import { selectCheck, selectDraw, selectMate, selectTurn } from "../gameSlice";
import { PieceColor } from "../../piece/enums";
import { store } from "../../../app/store";
import { movePiece } from "../../piece/pieceSlice";

describe("Game", () => {
  const { dispatch, getState } = store

  describe("turns change", () => {
    beforeAll(() => {
      dispatch(initSquares())
      dispatch(initPieces())
    })

    it("switches turn", () => {
      let turn = selectTurn(getState())
      expect(turn).toEqual(PieceColor.WHITE)

      dispatch(movePiece({ from: "E2", to: "E4" }))
      turn = selectTurn(getState())
      expect(turn).toEqual(PieceColor.BLACK)

      dispatch(movePiece({ from: "E7", to: "E5" }))
      turn = selectTurn(getState())
      expect(turn).toEqual(PieceColor.WHITE)
    })
  })

  describe("processes game states correctly", () => {
    beforeEach(() => {
      dispatch(initSquares())
    })

    it("processes check state correctly", () => {
      dispatch(initPiecesCheck())
      dispatch(processGameState())

      const check = selectCheck(getState())

      expect(check!.to).toEqual(PieceColor.BLACK)
    })


    it("processes mate state correctly", () => {
      dispatch(initPiecesMate())
      dispatch(processGameState())

      const mateTo = selectMate(getState())

      expect(mateTo).toEqual(PieceColor.BLACK)
    })

    it("processes draw state correctly", () => {
      dispatch(initPiecesDraw())
      dispatch(processGameState())

      const draw = selectDraw(getState())

      expect(draw).toEqual(true)
    })
  })
})