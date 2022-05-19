import styles from "./Piece.module.css"
import { dragPiece, dropPiece } from "./pieceSlice"
import { FC } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectGameOver, selectTurn } from "../game/gameSlice"
import { ISquare } from "../square/types"

interface Props {
  square: ISquare;
}

export const Piece: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)
  const gameOver = useAppSelector(selectGameOver)

  const [ collected, drag ] = useDrag(() => ({
    type: "piece",
    end: () => {
      dispatch(dropPiece())
    },
    canDrag: () => {
      return turn === square.piece!.color && !gameOver
    },
    collect: (monitor) => {
      if (monitor.isDragging()) {
        dispatch(dragPiece(square.piece!))
      }
      return {
        piece: square.piece,
        canDrag: monitor.canDrag(),
        isDragging: monitor.isDragging(),
      }
    },
  }), [ square, turn ])


  if (!square.piece) return null
  const { piece: { color, type } } = square

  return <div
    ref={drag}
    className={classNames({
      [styles.Dragging]: collected.isDragging,
      [styles.Piece]: true,
      [styles[`Piece${color}${type}`]]: true
    })
    }
  />
}
