import styles from './Piece.module.css'
import {PieceType} from "./pieceSlice";
import {FC} from "react";
import classNames from "classnames";

interface Props {
  type: PieceType
}

export const Piece: FC<Props> = ({ type }) => {
  return <div className={classNames([styles.Piece, styles[`Piece${type}`]])}/>
}