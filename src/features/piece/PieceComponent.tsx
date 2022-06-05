import styles from "./Piece.module.css"
import { dropPiece, selectLast } from "./pieceSlice"
import { FC, useEffect, useState } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectGameOver, selectThreat, selectTurn } from "../game/gameSlice"
import { Piece } from "./types"
import { dragHandler } from "./thunks";
import { selectBoardRotated } from "../board/boardSlice";
import { selectOptions } from "../options/optionsSlice";

interface Props {
  piece: Piece;
}

export const PieceComponent: FC<Props> = ({ piece }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)
  const gameOver = useAppSelector(selectGameOver)
  const threatPosition = useAppSelector(selectThreat)
  const boardRotationEnabled = useAppSelector(selectOptions).ENABLE_ROTATION

  /**
   * Rotation workaround
   */
  const last = useAppSelector(selectLast)
  const boardRotated = useAppSelector(selectBoardRotated)
  /**
   * Initially we should rotate every piece but current depending on board rotation state
   */
  const getInitialRotationState = () => boardRotated ? last !== piece.position : last === piece.position
  const [ rotate, setRotate ] = useState<boolean>(getInitialRotationState())

  useEffect(() => {
    if (!boardRotationEnabled) return

    // Every piece should be rotated in main thread
    if (last !== piece.position) {
      setRotate(boardRotated)
    } else {
      // Current dropped piece should be rotated after mounting to prevent instant rotation
      setTimeout(() => {
        setRotate(boardRotated)
      }, 0)
    }

  }, [ boardRotated, boardRotationEnabled, last, piece ])

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
      [styles.rotated]: rotate,
      [styles[`${ color.toLowerCase() }_${ type.toLowerCase() }`]]: true
    })
    }
  />
}
