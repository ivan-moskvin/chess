import { store } from "../../../app/store";
import { PieceColor, PieceType } from "../../piece/enums";
import { initPieces, initSquares, processGameState } from "../boardSlice";
import { getPiece } from "../utils";
import { initPiecesCheck, initPiecesDraw, initPiecesMate } from "./piecePositions";

const { dispatch, getState } = store

// Placing pieces
it("should place pieces correctly", () => {
  dispatch(initSquares())
  dispatch(initPieces())

  const { board: { squares } } = store.getState()

  expect(getPiece("E8", squares)).toMatchObject({
    "color": PieceColor.BLACK,
    "moved": false,
    "position": "E8",
    "coords": {
      file: 4,
      rank: 0
    },
    "type": PieceType.KING,
  })

  expect(getPiece("B1", squares)).toMatchObject({
    "color": PieceColor.WHITE,
    "type": PieceType.KNIGHT,
  })

  expect(getPiece("H8", squares)).toMatchObject({
    "color": PieceColor.BLACK,
    "type": PieceType.ROOK,
  })
})

describe("processes game states correctly", () => {
  it("processes check state correctly", () => {
    dispatch(initPiecesCheck())
    dispatch(processGameState())

    const { check } = getState().game
    expect(check!.to).toEqual(PieceColor.BLACK)
  })

  /**
   * TODO: Add moves and check if it leads to check
   */

  it("processes mate state correctly", () => {
    dispatch(initPiecesMate())
    dispatch(processGameState())

    const { mateTo } = getState().game
    expect(mateTo).toEqual(PieceColor.BLACK)
  })

  /**
   * TODO: Add moves and check if it leads to mate
   * Kinder mate for example
   */

  it("processes draw state correctly", () => {
    dispatch(initPiecesDraw())
    dispatch(processGameState())

    const { draw } = getState().game
    expect(draw).toEqual(true)
  })
})

/**
 * TODO:
 * - Moving patterns
 * - Moving restrictions
 * - Turns change
 * - Time travel
 */

