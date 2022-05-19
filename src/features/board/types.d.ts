import { PiecePosition } from "../piece/types"
import { ISquare } from "../square/types"

export type PossibleMovements = { [key: PiecePosition]: 1 }

export interface Board {
  squares: ISquare[][],
  activeSquare: string,
  possibleMovements: PossibleMovements,
}
