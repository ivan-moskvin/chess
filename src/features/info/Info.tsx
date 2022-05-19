import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectDraw, selectMate, selectTurn } from "../game/gameSlice"
import { History } from "../history/History"
import { useTranslation } from "react-i18next"

export const Info = () => {
  const { t } = useTranslation()
  const turn = useAppSelector(selectTurn)
  const mateTo = useAppSelector(selectMate)
  const draw = useAppSelector(selectDraw)

  return (
    <section className={ styles.Info }>
      <div className={ styles.content }>
        { !mateTo && !draw && <p>{ t("turn") }: <strong>{ t(turn) }</strong></p> }
        { draw && <h2 className={ styles.draw }>{ t("draw") }</h2> }
        { <History/> }
      </div>

    </section>
  )
}
