import { PieceColor } from "../piece/enums"
import { PiecePosition } from "../piece/types"

export interface Check {
  to: PieceColor,
  trajectory?: PiecePosition[]
}

export interface Game {
  turn: PieceColor,
  check: Check | null,
  threatPosition: PiecePosition | null,
  mateTo: PieceColor | null,
  draw: boolean,
  gameOver: boolean,
}
