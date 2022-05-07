import styles from './Field.module.css'
import {useAppSelector} from "../../app/hooks";
import {selectCells} from "./fieldSlice";
import {Row} from "../row/Row";

export function Field() {
  const rows = useAppSelector(selectCells);


  return (
    <section className={styles.Field}>
      {
        rows.map((row, i) => <Row key={i} row={ row }/>)
      }
    </section>
  )
}