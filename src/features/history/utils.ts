import { PiecePosition } from "../piece/types"
import { MovementType } from "../board/enums"
import i18n from "i18next"
import { LANG } from "../../i18n/i18n"

export const getHistoryItemName = (position: PiecePosition, to: PiecePosition, type: MovementType): string => {
  return `${ position } \u21e8 ${ to }${
    type === MovementType.CASTLE ? "(" + i18n.t(LANG.CASTLE) + ")" : ""
  }`
}
