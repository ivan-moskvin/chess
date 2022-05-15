import { IPiece } from "../piece/pieceSlice";

export enum SquareColor {
  BLACK,
  WHITE
}

export interface ISquare {
  color: SquareColor,
  piece?: IPiece,
  position: string,
  active: boolean,
  coords: [ y: number, x: number ]
}
