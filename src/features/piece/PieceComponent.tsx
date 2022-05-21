import styles from "./Piece.module.css"
import { dragPiece, dropPiece } from "./pieceSlice"
import { FC } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectGameOver, selectTurn } from "../game/gameSlice"
import { Piece } from "./types";

interface Props {
  piece: Piece;
}

export const PieceComponent: FC<Props> = ({ piece }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)
  const gameOver = useAppSelector(selectGameOver)

  const [ collected, drag ] = useDrag(() => ({
    type: "piece",
    end: () => {
      dispatch(dropPiece())
    },
    canDrag: () => {
      return turn === piece!.color && !gameOver
    },
    collect: (monitor) => {
      if (monitor.isDragging()) {
        dispatch(dragPiece(piece))
      }
      return {
        piece: piece,
        canDrag: monitor.canDrag(),
        isDragging: monitor.isDragging(),
      }
    },
  }), [ piece, turn ])


  if (!piece) return null
  const { color, type } = piece

  return <div
    ref={ drag }
    className={ classNames({
      [styles.dragging]: collected.isDragging,
      [styles.piece]: true,
      [styles[`${ color.toLowerCase() }_${ type.toLowerCase() }`]]: true
    })
    }
  />
}
