import { store } from "../../app/store";
import { PieceColor, PieceType } from "../piece/enums";
import { initSquares, selectSquares } from "./boardSlice";
import { getPieceByPosition } from "./utils";
import { initPiecesPreCheck, initPiecesTestingPatterns } from "../../app/piecePositions";
import { initPieces } from "./thunks";
import { dropPiece } from "../piece/pieceSlice";
import { dragHandler, movePieceFromTo } from "../piece/thunks";
import { selectCheck, selectMate } from "../game/gameSlice";

describe("Board", function () {
  const { dispatch, getState } = store

  describe("piece placing", function () {
    beforeAll(() => {
      dispatch(initSquares())
      dispatch(initPieces())
    })

    it("should place pieces correctly", () => {
      const squares = selectSquares(getState())

      expect(getPieceByPosition("E8", squares)).toMatchObject({
        "color": PieceColor.BLACK,
        "moved": false,
        "position": "E8",
        "coords": {
          file: 4,
          rank: 0
        },
        "type": PieceType.KING,
      })

      expect(getPieceByPosition("B1", squares)).toMatchObject({
        "color": PieceColor.WHITE,
        "type": PieceType.KNIGHT,
      })

      expect(getPieceByPosition("H8", squares)).toMatchObject({
        "color": PieceColor.BLACK,
        "type": PieceType.ROOK,
      })
    })
  });

  describe("movement sequences", () => {
    beforeEach(() => {
      dispatch(initSquares())
    })

    it("processes check state after move", () => {
      dispatch(initPiecesPreCheck())
      dispatch(movePieceFromTo("H4", "H5"))

      const check = selectCheck(getState())

      expect(check!.to).toEqual(PieceColor.BLACK)
    })

    it("processes kinder mate", () => {
      dispatch(initPieces())

      dispatch(movePieceFromTo("E2", "E4"))
      dispatch(movePieceFromTo("E7", "E5"))
      dispatch(movePieceFromTo("F1", "C4"))
      dispatch(movePieceFromTo("B8", "C6"))
      dispatch(movePieceFromTo("D1", "H5"))
      dispatch(movePieceFromTo("G8", "F6"))
      dispatch(movePieceFromTo("H5", "F7"))

      const mateTo = selectMate(getState())

      expect(mateTo).toEqual(PieceColor.BLACK)
    })
  })

  describe("movement patterns", () => {
    beforeEach(() => {
      dispatch(initSquares())
    })

    afterEach(() => dispatch(dropPiece()))

    it("builds moves for pawn", () => {
      dispatch(initPieces())

      const { squares } = getState().board
      const pawn = getPieceByPosition("E2", squares)

      // Grab pawn
      dispatch(dragHandler(pawn!))

      const moves = getState().board.possibleMovements

      expect(moves).toHaveProperty("E3")
      expect(moves).toHaveProperty("E4")
    })

    it("builds moves for knight", () => {
      dispatch(initPiecesTestingPatterns())

      const { squares } = getState().board
      const knight = getPieceByPosition("E5", squares)

      // Grab knight
      dispatch(dragHandler(knight!))

      const moves = getState().board.possibleMovements

      expect(moves).toHaveProperty("D7")
      expect(moves).toHaveProperty("F7")
      expect(moves).toHaveProperty("C6")
      expect(moves).toHaveProperty("G6")
      expect(moves).toHaveProperty("C4")
      expect(moves).toHaveProperty("G4")
      expect(moves).toHaveProperty("D3")
      expect(moves).toHaveProperty("F3")
    })

    it("builds moves for queen", () => {
      dispatch(initPiecesTestingPatterns())

      const { squares } = getState().board
      const queen = getPieceByPosition("B2", squares)

      // Grab queen
      dispatch(dragHandler(queen!))

      const moves = getState().board.possibleMovements

      expect(moves).toEqual({
        "B3": 0,
        "B4": 0,
        "B5": 0,
        "B6": 0,
        "B7": 0,
        "B8": 0,
        "B1": 0,
        "A2": 0,
        "C2": 0,
        "D2": 0,
        "E2": 0,
        "F2": 0,
        "A3": 0,
        "C3": 0,
        "D4": 0,
        "A1": 0,
        "C1": 0
      })

    })

    it("builds moves for king", () => {
      dispatch(initPiecesTestingPatterns())

      const { squares } = getState().board
      const king = getPieceByPosition("G2", squares)

      // Grab queen
      dispatch(dragHandler(king!))

      const moves = getState().board.possibleMovements


      expect(moves).toEqual({
        "G3": 0,
        "H2": 0,
        "F1": 0,
        "H1": 0
      })
    })
  })
});
