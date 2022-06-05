import styles from "./Square.module.css"
import { FC } from "react"
import classNames from "classnames"

import { PieceComponent } from "../piece/PieceComponent"
import { useDrop } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectCurrentPiece, setLast } from "../piece/pieceSlice"
import { Square } from "./types"
import { SquareColor } from "./enums"
import { useSelector } from "react-redux"
import { selectPossibleMovements } from "../board/boardSlice"
import _ from "underscore"
import { movePieceTo } from "../piece/thunks";

interface Props {
  square: Square
}

export const SquareComponent: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch()
  const currentPiece = useAppSelector(selectCurrentPiece)
  const possibleMovements = useSelector(selectPossibleMovements, _.isEqual)

  const [ , drop ] = useDrop(() => ({
    accept: "piece",
    drop: () => {
      if (square.position !== currentPiece.position) {
        dispatch(movePieceTo(square.position))
        dispatch(setLast(square.position))
      }
    },
    canDrop: () => {
      return square.position === currentPiece.position
        || square.position in possibleMovements
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  }), [ currentPiece, square.position ])

  return <div
    ref={ drop }
    className={
      classNames({
        [styles.square]: true,
        [styles.possible]: square.position in possibleMovements,
        [styles.black]: square.color === SquareColor.BLACK,
        [styles.white]: square.color === SquareColor.WHITE
      })
    }
  >{ square.piece ?
    <PieceComponent piece={ square.piece }/> : null }</div>
}
