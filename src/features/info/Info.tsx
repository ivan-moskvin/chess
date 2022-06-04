import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectCheck, selectDraw, selectMate, selectTurn } from "../game/gameSlice"
import { History } from "../history/History"
import { useTranslation } from "react-i18next"
import { LANG } from "../../i18n/i18n"
import classNames from "classnames"
import { PieceColor, PieceType } from "../piece/enums"
import { getPieceIcon } from "../piece/utils"
import { Options } from "../options/Options";

export const Info = () => {
  const { t } = useTranslation()
  const turn = useAppSelector(selectTurn)
  const mateTo = useAppSelector(selectMate)
  const draw = useAppSelector(selectDraw)
  const check = useAppSelector(selectCheck)
  const getGameStateIndicator = (to: PieceColor) => <span
    className={ styles.pieceIcon }>{ getPieceIcon(PieceType.KING, to) }</span>

  return (
    <section className={ styles.info }>
      <div className={ styles.content }>
        { check && <h2
          className={ classNames([ styles.checkState, styles.state ]) }>{ t(LANG.CHECK) }({ getGameStateIndicator(check.to) })</h2> }
        { mateTo && <h2
          className={ classNames([ styles.mateState, styles.state ]) }>{ t(LANG.MATE) }({ getGameStateIndicator(mateTo) })</h2> }
        { draw && <h2
          className={ classNames([ styles.drawState, styles.state ]) }>{ t(LANG.DRAW) }</h2> }
        { !mateTo && !draw && !check && <p>{ t(LANG.TURN) }: <strong>{ t(turn) }</strong></p> }
        <History/>
        <Options/>
      </div>

    </section>
  )
}
