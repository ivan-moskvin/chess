export interface Game {
  turn: PieceColor,
  checkTo: PieceColor | null,
  mateTo: PieceColor | null,
  draw: boolean,
  gameOver: boolean,
}
