import { createSlice } from "@reduxjs/toolkit"
import { ISquare, SquareColor } from "../square/squareSlice"
import { AppThunk, RootState } from "../../app/store"
import {dragPiece, dropPiece,
  getCoordFromPosition,
  movePieceFromTo,
  PieceColor,
  PieceType, placePiece
} from "../piece/pieceSlice"

interface Board {
  squares: ISquare[][],
  activeSquare: string,
}

const boardSlice = createSlice({
  name: "field",
  initialState: {
    squares: [],
    activeSquare: ""
  } as Board,
  reducers: {
    initCells: (state: Board) => {
      const squares =
        new Array(8)
          .fill(null)
          .map(() =>
            new Array(8)
              .fill(null)
              .map(() => ({} as ISquare)))

      const n = squares.length
      const m = squares[0].length

      for (let i = 0, rowCount = 8; i < n; i++, rowCount--) {
        const isEvenRow = i % 2 === 0

        for (let j = 0, charCode = 97; j < m; j++, charCode++) {
          const name = String.fromCharCode(charCode).toUpperCase() + rowCount
          if (!isEvenRow) {
            squares[i][j].color = j % 2 === 0 ? SquareColor.BLACK : SquareColor.WHITE
          } else {
            squares[i][j].color = j % 2 === 0 ? SquareColor.WHITE : SquareColor.BLACK
          }

          // Set square's name
          squares[i][j].position = name
        }
      }

      state.squares = squares
    }
  }, extraReducers: (builder) => {
    builder.addCase(placePiece, (state, action) => {
      const { position, type, color } = action.payload
      const [rank, file] = getCoordFromPosition(position)

      state.squares[rank][file].piece = {
        type,
        color,
        position: position.toUpperCase(),
      }
    })
    builder
      .addCase(dragPiece, (state, action) => {
        state.activeSquare = action.payload.position
      })
    builder.addCase(dropPiece, (state) => {
      state.activeSquare = ""
    })
    builder.addCase(movePieceFromTo, (state, action) => {
      const { from, to, piece } = action.payload

      const [rankFrom, fileFrom] = getCoordFromPosition(from)
      const [rankTo, fileTo] = getCoordFromPosition(to)

      delete state.squares[rankFrom][fileFrom].piece
      state.squares[rankTo][fileTo].piece = piece
    })
  }
})

export const { initCells } = boardSlice.actions


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
      }
      for (let i = 0, charCode = 97; i < 8; i++, charCode++) {
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
      dispatch(placePiece({ position: "E8", type: PieceType.QUEEN, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "D1", type: PieceType.QUEEN, color: PieceColor.WHITE }))

      // Place kings
      dispatch(placePiece({ position: "D8", type: PieceType.KING, color: PieceColor.BLACK }))
      dispatch(placePiece({ position: "E1", type: PieceType.KING, color: PieceColor.WHITE }))
    }


export const selectSquares = (state: RootState) => state.board.squares

export const selectActiveSquare = (state: RootState) => state.board.activeSquare

export default boardSlice.reducer
