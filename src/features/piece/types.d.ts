import { MovementType } from "../board/enums";

export interface Piece {
  position: string,
  type: PieceType,
  color: PieceColor,
  moved?: boolean,
  underCheck?: boolean,
  coords: {
    rank: number,
    file: number
  }
}

export type PlacePiece = Pick<Piece, "position", "type", "color">

export interface Movement {
  from: string,
  to: string,
  piece: Piece,
  type: MovementType
}

export interface ModifyType {
  piece: Piece,
  newType: PieceType
}

export type PiecePosition = string
