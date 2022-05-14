import styles from "./Piece.module.css"
import { dragPiece, dropPiece } from "./pieceSlice"
import { FC } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { ISquare } from "../square/squareSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectTurn } from "../game/gameSlice"

interface Props {
  square: ISquare;
}

export const Piece: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)

  const [collected, drag] = useDrag(() => ({
    type: "piece",
    end: () => {
      dispatch(dropPiece())
    },
    canDrag: () => {
      return turn === square.piece!.color
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
  }), [square, turn])


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
