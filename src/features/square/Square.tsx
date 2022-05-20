import styles from "./Square.module.css"
import { FC } from "react"
import classNames from "classnames"
import { Piece } from "../piece/Piece"
import { useDrop } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectActiveSquare, selectPossibleMovements } from "../board/boardSlice"
import { movePieceTo, selectCurrentPiece } from "../piece/pieceSlice"
import { ISquare } from "./types"
import { SquareColor } from "./enums";

interface Props {
  square: ISquare
}

export const Square: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch()
  const currentPiece = useAppSelector(selectCurrentPiece)
  const activeSquare = useAppSelector(selectActiveSquare)
  const possibleMovements = useAppSelector(selectPossibleMovements)

  const [ , drop ] = useDrop(() => ({
    accept: "piece",
    drop: () => {
      dispatch(movePieceTo(square.position))
    },
    canDrop: () => square.position in possibleMovements,
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  }), [ currentPiece, square.position ])

  return <div
    ref={ drop }
    className={ classNames([
      styles.Square,
      square.position === activeSquare ? styles.active : null,
      square.position in possibleMovements ? styles.possible : null,
      square.color === SquareColor.BLACK
        ? styles.black
        : styles.white ]) }
  >{ square.piece ? <Piece square={ square }/> : null }</div>
}
