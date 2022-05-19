export interface ISquare {
  color: SquareColor,
  piece?: IPiece,
  position: string,
  active: boolean,
  coords: [ y: number, x: number ]
}
