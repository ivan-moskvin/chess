import { PiecePosition } from "../piece/types"
import { MovementType } from "./enums";
import { Squares } from "../square/types";

export type PossibleMovements = { [key: PiecePosition]: MovementType }

export interface Board {
  squares: Squares,
  activeSquare: string,
  possibleMovements: PossibleMovements,
}
