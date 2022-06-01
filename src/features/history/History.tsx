import { selectHistory } from "./historySlice"
import { useAppSelector } from "../../app/hooks"
import styles from "./History.module.css"
import { HistoryItem } from "./HistoryItem"
import { useTranslation } from "react-i18next"
import { useLayoutEffect, useRef } from "react"
import { LANG } from "../../i18n/i18n"

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
      <h3 className={ styles.heading }>{ t(LANG.MOVES) }:</h3>
      <ul className={ styles.list } ref={ listRef }>
        { history.map((historyItem, i) => <HistoryItem key={ historyItem.name } historyItem={ historyItem }
                                                       last={ i === history.length - 1 }/>) }
      </ul>
    </section>
  )
}
