import { selectHistory } from "./historySlice"
import { useAppSelector } from "../../app/hooks"
import styles from "./History.module.css"
import { HistoryItem } from "./HistoryItem"
import { useTranslation } from "react-i18next"
import { useLayoutEffect, useRef } from "react"

export const History = () => {
  const { t } = useTranslation()
  const history = useAppSelector(selectHistory)
  const listRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    listRef.current?.scroll(0, listRef.current?.scrollHeight)
  }, [ history ])

  if (!history.length) return null

  return (
    <section className={ styles.history }>
      <h3 className={ styles.heading }>{ t("Moves (click to traverse)") }:</h3>
      <ul className={ styles.list } ref={ listRef }>
        { history.map((historyItem) => <HistoryItem key={ historyItem.name } historyItem={ historyItem }/>) }
      </ul>
    </section>
  )
}
