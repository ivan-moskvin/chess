import { MovementType } from "../board/enums";

export interface IPiece {
  position: string,
  type: PieceType,
  color: PieceColor,
  moved?: boolean,
  underCheck?: boolean,
}

export interface Movement {
  from: string,
  to: string,
  piece: IPiece,
  type: MovementType
}

export interface ModifyType {
  piece: IPiece,
  newType: PieceType
}

export type PiecePosition = string
