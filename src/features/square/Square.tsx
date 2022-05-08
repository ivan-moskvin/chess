import styles from './Square.module.css'
import {Square as SquareType, SquareColor} from "./squareSlice";
import {FC} from "react";
import classNames from "classnames";

interface Props {
  square: SquareType
}

export const Square: FC<Props> = ({ square }) => {
  return <div
    className={classNames([
      styles.Square,
      square.color === SquareColor.BLACK
        ? styles.black
        : styles.white])}
  >{square.name}</div>
}