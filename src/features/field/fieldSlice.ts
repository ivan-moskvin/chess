import {createSlice} from "@reduxjs/toolkit";
import {Piece} from "../piece/pieceSlice";
import {Cell, CellColor} from "../cell/cellSlice";
import {RootState} from "../../app/store";


interface Field {
  cells: Cell[][]
  pieces : Piece[]
}

export const selectCells = (state: RootState) => state.field.cells;

const fieldSlice = createSlice({
  name: 'field',
  initialState: {
    cells: new Array(8)
      .fill(
        new Array(8)
          .fill({ color: CellColor.BLACK })
      )
  } as Field,
  reducers: {}
})

export default fieldSlice.reducer;