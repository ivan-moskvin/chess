import { store } from "../../app/store";
import { placePiece } from "../piece/pieceSlice";
import { PieceColor, PieceType } from "../piece/enums";
import { initPieces, initSquares } from "./boardSlice";
import { getCoordFromPosition } from "../piece/utils";

const { dispatch } = store

beforeAll(() => {
  dispatch(initSquares())
  dispatch(initPieces())
})

it("should place pieces correctly", () => {
  dispatch(placePiece({ position: "E8", type: PieceType.KING, color: PieceColor.BLACK }))
  
  const [ y, x ] = getCoordFromPosition("E8")

  expect(store.getState().board.squares[y][x].piece).toEqual({
    "color": PieceColor.BLACK,
    "moved": false,
    "position": "E8",
    "type": PieceType.KING,
  })
})


// squares: [],
//     activeSquare: "",
//     possibleMovements: {}


// Placing pieces
// Moving pieces
// Beating
// Check/mate/draw
// Cannot put king under threat
// Can castle
// Cannot castle