import styles from './Piece.module.css'
import {IPiece} from "./pieceSlice";
import {FC} from "react";
import classNames from "classnames";

interface Props {
  piece: IPiece
}

export const Piece: FC<Props> = ({ piece }) => {
  const { color, type } = piece;

  return <div className={classNames([styles.Piece, styles[`Piece${color}${type}`]])}/>
}