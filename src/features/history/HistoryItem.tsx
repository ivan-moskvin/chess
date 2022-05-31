import { FC } from "react"
import { traverseToMove } from "./historySlice"
import styles from "./History.module.css"
import { useAppDispatch } from "../../app/hooks"
import { HistoryItem as HistoryItemType } from "./types"
import { getPieceIcon } from "../piece/utils"

type HistroyItemProps = {
  historyItem: HistoryItemType
}

export const HistoryItem: FC<HistroyItemProps> = ({ historyItem }) => {
  const dispatch = useAppDispatch()

  const {
    name,
    piece: {
      current: {
        type,
        color
      }
    }
  } = historyItem

  return (
    <li key={ name } className={ styles.item } onClick={ () => dispatch(traverseToMove(name)) }>
      <div className={ styles.piece }>{ getPieceIcon(type, color) }</div>
      <div className={ styles.move }
      >{ name }
      </div>
    </li>
  )
}
