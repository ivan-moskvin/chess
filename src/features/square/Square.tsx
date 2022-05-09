import styles from './Square.module.css'
import {ISquare, SquareColor} from "./squareSlice";
import {FC} from "react";
import classNames from "classnames";
import {Piece} from "../piece/Piece";

interface Props {
  square: ISquare
}

export const Square: FC<Props> = ({ square }) => {
  return <div
    className={classNames([
      styles.Square,
      square.color === SquareColor.BLACK
        ? styles.black
        : styles.white])}
  >{square.piece ? <Piece piece={square.piece} /> : null}</div>
}