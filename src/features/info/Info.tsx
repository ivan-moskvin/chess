import styles from "./Info.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectDraw, selectMate, selectTurn } from "../game/gameSlice"
import { History } from "../history/History";

export const Info = () => {
  const turn = useAppSelector(selectTurn)
  const mateTo = useAppSelector(selectMate)
  const draw = useAppSelector(selectDraw)

  return (
    <section className={ styles.Info }>
      <div className={ styles.content }>
        { !mateTo && !draw && <p>Turn: <strong>{ turn }</strong></p> }
        { <History/> }
      </div>

    </section>
  )
}
