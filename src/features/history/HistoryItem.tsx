import { FC } from "react";
import { HistoryItem as HistoryItemType, traverseToMove } from "./historySlice";
import styles from "./History.module.css";
import { getPieceIcon, PieceColor, PieceType } from "../piece/pieceSlice";
import { useAppDispatch } from "../../app/hooks";
import classNames from "classnames";

type HistroyItemProps = {
  historyItem: HistoryItemType
}

export const HistoryItem: FC<HistroyItemProps> = ({ historyItem }) => {
  const dispatch = useAppDispatch()
  const getGameStateIndicator = (to: PieceColor) => getPieceIcon(PieceType.KING, to)

  const {
    name,
    game: {
      checkTo,
      mateTo
    },
    piece: {
      current: {
        type,
        color
      }
    }
  } = historyItem


  return (
    <li key={ name } className={ styles.item }>
      <span className={ styles.piece }>{ getPieceIcon(type, color) }</span>
      <span className={ styles.move }
            onClick={ () => dispatch(traverseToMove(name)) }>{ name }
        { checkTo && <span
          className={ classNames([ styles.checkState, styles.state ]) }>Check({ getGameStateIndicator(checkTo) })</span> }
        { mateTo && <span
          className={ classNames([ styles.mateState, styles.state ]) }>Check({ getGameStateIndicator(mateTo) })</span> }
      </span>
    </li>
  )
}