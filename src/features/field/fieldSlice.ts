import {createSlice} from "@reduxjs/toolkit";
import {Piece} from "../piece/pieceSlice";
import {Cell, CellColor} from "../cell/cellSlice";
import {RootState} from "../../app/store";


interface Field {
  cells: Cell[][]
  pieces : Piece[]
}

export const selectCells = (state: RootState) => state.field.cells;

function getInitialCells(): Cell[][] {
  const cells = new Array(8).fill(null).map(() => new Array(8).fill(null).map(() => ({} as Cell)))

  const n = cells.length
  const m = cells[0].length

  for(let i = 0; i < n; i++) {
    const isEvenRow = i % 2 !== 0;

    for(let j = 0; j < m; j++) {
      if(!isEvenRow) {
        cells[i][j].color = j % 2 === 0 ? CellColor.BLACK : CellColor.WHITE
      } else {
        cells[i][j].color = j % 2 === 0 ? CellColor.WHITE : CellColor.BLACK
      }
    }
  }


  return cells
}

const fieldSlice = createSlice({
  name: 'field',
  initialState: {
    cells: getInitialCells()
  } as Field,
  reducers: {}
})

export default fieldSlice.reducer