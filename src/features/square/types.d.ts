export interface Square {
  color: SquareColor,
  piece?: Piece,
  position: string,
  active: boolean,
  coords: [ y: number, x: number ]
}

export type Squares = Square[][]