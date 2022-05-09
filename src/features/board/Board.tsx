import styles from './Board.module.css'
import {useAppSelector} from "../../app/hooks"
import {selectSquares} from "./boardSlice"
import {Rank} from "../rank/Rank"
import {Naming} from "../naming/Naming"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export function Board() {
  const ranks = useAppSelector(selectSquares);


  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.BoardWrapper}>
          <section className={styles.Board}>
            <div className={styles.NamingWrapper}>
              <Naming />
              <div className={styles.Squares}>
                {
                  ranks.map((rank, i) => <Rank key={i} rank={ rank }/>)
                }
              </div>
            </div>
          </section>
      </div>
    </DndProvider>
  )
}