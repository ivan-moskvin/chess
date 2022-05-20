import { FC } from "react"
import { traverseToMove } from "./historySlice"
import styles from "./History.module.css"
import { useAppDispatch } from "../../app/hooks"
import classNames from "classnames"
import { useTranslation } from "react-i18next"
import { HistoryItem as HistoryItemType } from "./types"
import { getPieceIcon } from "../piece/utils"
import { PieceColor, PieceType } from "../piece/enums";

type HistroyItemProps = {
  historyItem: HistoryItemType
}

export const HistoryItem: FC<HistroyItemProps> = ({ historyItem }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const getGameStateIndicator = (to: PieceColor) => getPieceIcon(PieceType.KING, to)

  const {
    name,
    game: {
      checkTo,
      mateTo,
      draw,
    },
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
        { checkTo && <span
          className={ classNames([ styles.checkState, styles.state ]) }>{ t("check") }({ getGameStateIndicator(checkTo) })</span> }
        { mateTo && <span
          className={ classNames([ styles.mateState, styles.state ]) }>{ t("mate") }({ getGameStateIndicator(mateTo) })</span> }
        { draw && <span
          className={ classNames([ styles.drawState, styles.state ]) }>{ t("draw") }</span> }
      </div>
    </li>
  )
}
