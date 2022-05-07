import styles from './Field.module.css'
import {useAppSelector} from "../../app/hooks";
import {selectCells} from "./fieldSlice";
import {Row} from "../row/Row";
import classNames from "classnames";

export function Field() {
  const rows = useAppSelector(selectCells);


  return (
    <div className={classNames(styles.FieldWrapper)}>
      <section className={styles.Field}>
        {
          rows.map((row, i) => <Row key={i} row={ row }/>)
        }
      </section>
    </div>
  )
}