import styles from "./Piece.module.css"
import { dropPiece, selectLastMovedPiece } from "./pieceSlice"
import { FC, useEffect, useState } from "react"
import classNames from "classnames"
import { useDrag } from "react-dnd"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectGameOver, selectThreatPosition, selectTurn } from "../game/gameSlice"
import { Piece } from "./types"
import { dragHandler } from "./thunks"
import { selectBoardRotated } from "../board/boardSlice"
import { selectOptions } from "../options/optionsSlice"

interface Props {
  piece: Piece;
}

export const PieceComponent: FC<Props> = ({ piece: currentPiece }) => {
  const dispatch = useAppDispatch()
  const turn = useAppSelector(selectTurn)
  const gameOver = useAppSelector(selectGameOver)
  const threatPosition = useAppSelector(selectThreatPosition)
  const boardRotationEnabled = useAppSelector(selectOptions).ENABLE_ROTATION

  /**
   * Rotation workaround
   */
  const lastMovedPiece = useAppSelector(selectLastMovedPiece)
  const boardRotated = useAppSelector(selectBoardRotated)
  /**
   * Initially we should rotate every piece but current depending on board rotation state
   */
  const getInitialRotationState = () => {
    if (!boardRotationEnabled) return false
    return boardRotated ? lastMovedPiece !== currentPiece.position : lastMovedPiece === currentPiece.position
  }
  const [ rotate, setRotate ] = useState<boolean>(getInitialRotationState())

  useEffect(() => {
    if (!boardRotationEnabled) return

    // Every piece should be rotated in main thread
    if (lastMovedPiece !== currentPiece.position) {
      setRotate(boardRotated)
    } else {
      // Current dropped piece should be rotated after mounting to prevent instant rotation
      setTimeout(() => {
        setRotate(boardRotated)
      }, 0)
    }

  }, [ boardRotated, boardRotationEnabled, lastMovedPiece, currentPiece ])

  const [ collected, drag ] = useDrag(() => ({
    type: "piece",
    end: () => {
      dispatch(dropPiece())
    },
    canDrag: () => {
      return turn === currentPiece!.color && !gameOver
    },
    collect: (monitor) => {
      if (monitor.isDragging()) {
        dispatch(dragHandler(currentPiece))
      }
      return {
        piece: currentPiece,
        canDrag: monitor.canDrag(),
        isDragging: monitor.isDragging(),
      }
    },
  }), [ currentPiece, turn ])


  if (!currentPiece) return null
  const { color, type } = currentPiece

  return <div
    ref={ drag }
    className={ classNames({
      [styles.dragging]: collected.isDragging,
      [styles.threat]: currentPiece.position === threatPosition,
      [styles.piece]: true,
      [styles.rotated]: rotate,
      [styles[`${ color.toLowerCase() }_${ type.toLowerCase() }`]]: true
    })
    }
  />
}
