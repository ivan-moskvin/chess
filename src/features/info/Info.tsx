import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectCheck, selectDraw, selectMate, selectTurn } from "../game/gameSlice"
import { History } from "../history/History"
import { useTranslation } from "react-i18next"

export const Info = () => {
  const { t } = useTranslation()
  const turn = useAppSelector(selectTurn)
  const mateTo = useAppSelector(selectMate)
  const draw = useAppSelector(selectDraw)
  const check = useAppSelector(selectCheck)

  return (
    <section className={ styles.info }>
      <div className={ styles.content }>
        { !mateTo && !draw && !check && <p>{ t("turn") }: <strong>{ t(turn) }</strong></p> }
        { check && <h2 className={ styles.check }>{ t("check") }</h2> }
        { draw && <h2 className={ styles.draw }>{ t("draw") }</h2> }
        { <History/> }
      </div>

    </section>
  )
}
