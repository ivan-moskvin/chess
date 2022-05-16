import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectCheck, selectDraw, selectMate, selectTurn } from "../game/gameSlice"

export const Info = () => {
  const turn = useAppSelector(selectTurn)
  const checkTo = useAppSelector(selectCheck)
  const mateTo = useAppSelector(selectMate)
  const draw = useAppSelector(selectDraw)

  return (
    <section className={styles.Info}>
      <div className={styles.content}>
        {!mateTo && !draw && <p>Turn: <strong>{turn}</strong></p>}
        {checkTo && <p>Check to: <strong>{checkTo}</strong></p>}
        {mateTo && <p>Mate to: <strong>{mateTo}</strong></p>}
        {draw && <p><strong>draw</strong></p>}
      </div>

    </section>
  )
}
