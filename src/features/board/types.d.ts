import { PiecePosition } from "../piece/types"
import { MovementType } from "./enums"
import { Squares } from "../square/types"

export interface PossibleMovements {
  [key: PiecePosition]: MovementType
}

export interface PieceMap {
  [key: string]: Piece
}

export interface Board {
  squares: Squares,
  possibleMovements: PossibleMovements,
  pieceMap: PieceMap
}
