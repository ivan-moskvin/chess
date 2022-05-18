import { selectHistory } from "./historySlice";
import { useAppSelector } from "../../app/hooks";
import styles from './History.module.css'
import { HistoryItem } from "./HistoryItem";

export const History = () => {
  const history = useAppSelector(selectHistory)

  if (!history.length) return null

  return (
    <section className={ styles.History }>
      <h3 className={ styles.heading }>Moves (click to traverse):</h3>
      <ul className={ styles.list }>
        { history.map((historyItem) => <HistoryItem key={ historyItem.name } historyItem={ historyItem }/>) }
      </ul>
    </section>
  )
}