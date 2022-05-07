import styles from './Cell.module.css'
import {Cell as CellType, CellColor} from "./cellSlice";
import {FC} from "react";
import classNames from "classnames";

interface Props {
  cell: CellType
}

export const Cell: FC<Props> = ({ cell }) => {
  return <div
    className={classNames([
      styles.Cell,
      cell.color === CellColor.BLACK
        ? styles.CellBlack
        : styles.CellWhite])}
  />
}