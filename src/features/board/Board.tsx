import styles from "./Board.module.css"
import { useAppSelector } from "../../app/hooks"
import { selectSquares } from "./boardSlice"
import { Rank } from "../rank/Rank"
import { Naming } from "../naming/Naming"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Info } from "../info/Info"

export function Board() {
  const ranks = useAppSelector(selectSquares)

  return (
    <DndProvider backend={ HTML5Backend }>
      <div className={ styles.wrapper }>
        <div className={ styles.items }>
          <section className={ styles.board }>
            <div className={ styles.naming_wrapper }>
              <Naming/>
              <div className={ styles.squares }>
                {
                  ranks.map((rank, i) => <Rank key={ i } rank={ rank }/>)
                }
              </div>
            </div>
          </section>
          <Info/>
        </div>
      </div>
    </DndProvider>
  )
}
