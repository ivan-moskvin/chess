import styles from "./Piece.module.css"
import { dropPiece } from "./pieceSlice"
import { FC } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectGameOver, selectThreat, selectTurn } from "../game/gameSlice"
import { Piece } from "./types"
import { dragHandler } from "./thunks";
import { selectBoardRotated } from "../board/boardSlice";

interface Props {
  piece: Piece;
}

export const PieceComponent: FC<Props> = ({ piece }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)
  const gameOver = useAppSelector(selectGameOver)
  const threatPosition = useAppSelector(selectThreat)
  const boardRotated = useAppSelector(selectBoardRotated)

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
        dispatch(dragHandler(piece))
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
      [styles.threat]: piece.position === threatPosition,
      [styles.piece]: true,
      [styles["piece--rotated"]]: boardRotated,
      [styles[`${ color.toLowerCase() }_${ type.toLowerCase() }`]]: true
    })
    }
  />
}
