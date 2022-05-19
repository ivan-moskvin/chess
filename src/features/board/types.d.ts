import { PiecePosition } from "../piece/types"
import { ISquare } from "../square/types"

export interface Board {
  squares: ISquare[][],
  activeSquare: string,
  possibleMovements: { [key: PiecePosition]: null },
}
