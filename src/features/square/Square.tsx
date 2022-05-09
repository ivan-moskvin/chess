import styles from './Square.module.css'
import {ISquare, SquareColor} from "./squareSlice";
import {FC} from "react";
import classNames from "classnames";
import {Piece} from "../piece/Piece";
import { useDrop } from 'react-dnd'
import {useAppDispatch} from "../../app/hooks"
import {movePieceTo} from "../board/boardSlice";

interface Props {
  square: ISquare
}

export const Square: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch();

  const [, drop] = useDrop(() => ({
    accept: 'piece',
    drop: () => {
      dispatch(movePieceTo(square.name))
    }
  }), [square.name])

  return <div
    ref={drop}
    className={classNames([
      styles.Square,
      square.color === SquareColor.BLACK
        ? styles.black
        : styles.white])}
  >{square.piece ? <Piece square={square} /> : null}</div>
}