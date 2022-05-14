import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectTurn } from "../game/gameSlice"

export const Info = () => {
  const turn = useAppSelector(selectTurn)
  return (
    <section className={styles.Info}>
      <div className={styles.content}>
        <p>Turn: <strong>{ turn }</strong></p>
      </div>

    </section>
  )
}
