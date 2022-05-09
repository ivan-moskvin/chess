import {IPiece} from "../piece/pieceSlice";

export enum SquareColor {
  BLACK,
  WHITE
}

export interface ISquare {
  color: SquareColor;
  piece: IPiece;
  name: string;
}