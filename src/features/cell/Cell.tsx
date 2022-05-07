import styles from './Cell.module.css'
import {Cell as CellType} from "./cellSlice";
import {FC} from "react";

interface Props {
  cell: CellType
}

export const Cell: FC<Props> = ({ cell }) => {
  return <div className={styles.Cell}>
    cell
  </div>
}