export enum PieceType {
  KING = "King",
  QUEEN = "Queen",
  ROOK = "Rook",
  BISHOP = "Bishop",
  KNIGHT = "Knight",
  PAWN = "Pawn"
}

export enum PieceColor {
  BLACK = "Black",
  WHITE = "White"
}

export interface IPiece {
  type: PieceType,
  color: PieceColor
}
