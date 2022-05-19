export interface IPiece {
  position: string,
  type: PieceType,
  color: PieceColor,
  moved?: boolean,
}

export interface Movement {
  from: string,
  to: string,
  piece: IPiece,
}

export interface ModifyType {
  piece: IPiece,
  newType: PieceType
}

export type PiecePosition = string
