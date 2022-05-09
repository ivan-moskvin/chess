import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ISquare, SquareColor} from "../square/squareSlice";
import {AppThunk, RootState} from "../../app/store";
import {IPiece, PieceColor, PieceType} from "../piece/pieceSlice";

interface Board {
  squares: ISquare[][],
}

/**
 * Getting coords from position name
 * @param name
 */
const getCoordFromPosition = (name: string): [ rank: number, file: number ] => {
  const [letter, digit] = name
  const rank = 8 - +digit
  const file = letter.toLowerCase().charCodeAt(0) - 97

  return [
    rank,
    file
  ]
}

const boardSlice = createSlice({
  name: 'field',
  initialState: {
    squares: [],
  } as Board,
  reducers: {
    setInitialCells: (state: Board) => {
      const squares =
        new Array(8)
          .fill(null)
          .map(() =>
            new Array(8)
              .fill(null)
              .map(() => ({} as ISquare)))

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

          // Set square's name
          squares[i][j].name = name
        }
      }

      state.squares = squares
    },
    placeFigure: (state: Board, action: PayloadAction<{ position: string, type: PieceType, color: PieceColor }>) => {
      const { position, type, color } = action.payload
      const [rank, file] = getCoordFromPosition(position);

      state.squares[rank][file].piece = {
        type,
        color,
        position: position.toUpperCase(),
      }
    },
    movePieceFromTo: (state: Board, action: PayloadAction<{ from: string, to: string, piece: IPiece }>) => {
      const { from, to, piece } = action.payload;

      const [rankFrom, fileFrom] = getCoordFromPosition(from);
      const [rankTo, fileTo] = getCoordFromPosition(to);

      state.squares[rankFrom][fileFrom].piece = {}
      state.squares[rankTo][fileTo].piece = piece
    }
  }
})

export const { setInitialCells, placeFigure, movePieceFromTo } = boardSlice.actions

export const selectSquares = (state: RootState) => state.board.squares;

export const setInitialPieces =
  (): AppThunk =>
    (dispatch) => {
      // Place pawns
      for(let i = 0, charCode = 97; i < 8; i++, charCode++) {
        dispatch(placeFigure({ position: String.fromCharCode(charCode) + '2', type: PieceType.PAWN, color: PieceColor.WHITE }))
      }
      for(let i = 0, charCode = 97; i < 8; i++, charCode++) {
        dispatch(placeFigure({ position: String.fromCharCode(charCode) + '7', type: PieceType.PAWN, color: PieceColor.BLACK }))
      }

      // Place rooks
      dispatch(placeFigure({position: 'A8', type: PieceType.ROOK, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'H8', type: PieceType.ROOK, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'A1', type: PieceType.ROOK, color: PieceColor.WHITE }));
      dispatch(placeFigure({position: 'H1', type: PieceType.ROOK, color: PieceColor.WHITE }));

      // Place bishops
      dispatch(placeFigure({position: 'B8', type: PieceType.BISHOP, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'G8', type: PieceType.BISHOP, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'B1', type: PieceType.BISHOP, color: PieceColor.WHITE }));
      dispatch(placeFigure({position: 'G1', type: PieceType.BISHOP, color: PieceColor.WHITE }));

      // Place knights
      dispatch(placeFigure({position: 'C8', type: PieceType.KNIGHT, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'F8', type: PieceType.KNIGHT, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'C1', type: PieceType.KNIGHT, color: PieceColor.WHITE }));
      dispatch(placeFigure({position: 'F1', type: PieceType.KNIGHT, color: PieceColor.WHITE }));

      // Place queens
      dispatch(placeFigure({position: 'E8', type: PieceType.QUEEN, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'D1', type: PieceType.QUEEN, color: PieceColor.WHITE }));

      // Place kings
      dispatch(placeFigure({position: 'D8', type: PieceType.KING, color: PieceColor.BLACK }));
      dispatch(placeFigure({position: 'E1', type: PieceType.KING, color: PieceColor.WHITE }));
    }


export const movePieceTo = (to: string): AppThunk => (dispatch, getState) => {
  const { piece: { current } } = getState()

  dispatch(movePieceFromTo({ from: current.position as string, to, piece: { ...current, position: to} }))
}




export default boardSlice.reducer