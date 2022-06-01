import { FC } from "react"
import { traverse } from "./historySlice"
import styles from "./History.module.css"
import { useAppDispatch } from "../../app/hooks"
import { HistoryItem as HistoryItemType } from "./types"
import { getPieceIcon } from "../piece/utils"

type HistroyItemProps = {
  historyItem: HistoryItemType
  last: boolean
}

export const HistoryItem: FC<HistroyItemProps> = ({ historyItem, last }) => {
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
    <li key={ name } className={ styles.item } onClick={ () => !last ? dispatch(traverse(name)) : null }>
      <div className={ styles.piece }>{ getPieceIcon(type, color) }</div>
      <div className={ styles.move }
      >{ name }
      </div>
    </li>
  )
}
