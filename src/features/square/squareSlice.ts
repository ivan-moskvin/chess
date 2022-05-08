import {Piece} from "../piece/pieceSlice";

export enum SquareColor {
  BLACK,
  WHITE
}

export interface Square {
  color: SquareColor;
  piece: Piece;
  name: string;
}