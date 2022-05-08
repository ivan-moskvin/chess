import {createSlice} from "@reduxjs/toolkit";
import {Square, SquareColor} from "../square/squareSlice";
import {RootState} from "../../app/store";
interface Board {
  squares: Square[][],
  boardMap: { [key: string]: Square }
}

const boardSlice = createSlice({
  name: 'field',
  initialState: {
    squares: [],
    boardMap: {}
  } as Board,
  reducers: {
    setInitialCells: (state: Board) => {
      const squares =
        new Array(8)
          .fill(null)
          .map(() =>
            new Array(8)
              .fill(null)
              .map(() => ({} as Square)))

      const n = squares.length
      const m = squares[0].length

      for(let i = 0, rowCount = 8; i < n; i++, rowCount--) {
        const isEvenRow = i % 2 === 0;

        for(let j = 0, charCode = 97; j < m; j++, charCode++) {
          const name = String.fromCharCode(charCode).toUpperCase() + rowCount
          if(!isEvenRow) {
            squares[i][j].color = j % 2 === 0 ? SquareColor.BLACK : SquareColor.WHITE
          } else {
            squares[i][j].color = j % 2 === 0 ? SquareColor.WHITE : SquareColor.BLACK
          }

          state.boardMap[name] = squares[i][j]
          squares[i][j].name = name
        }
      }

      state.squares = squares
    },
    setInitialPieces: () => {

    }
  }
})


export const selectSquares = (state: RootState) => state.field.squares;

export const selectBoardMap = (state: RootState) => state.field.boardMap;

export const { setInitialCells } = boardSlice.actions

export default boardSlice.reducer