import {Cell as CellType} from "../cell/cellSlice";
import {Cell} from "../cell/Cell";
import {FC} from "react";
import styles from './Row.module.css';

interface Props {
  row: CellType[]
}

export const Row: FC<Props> = ({ row }) => {
  return <div className={styles.Row}>
    {
      row.map((cell, i) => <Cell key={i} cell={cell} />)
    }
  </div>
}