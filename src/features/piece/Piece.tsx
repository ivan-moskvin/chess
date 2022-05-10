import styles from './Piece.module.css'
import { setCurrent } from "./pieceSlice";
import { FC } from "react";
import classNames from "classnames";
import { useDrag } from 'react-dnd';
import { ISquare } from "../square/squareSlice";
import { useAppDispatch } from "../../app/hooks";

interface Props {
  square: ISquare;
}

export const Piece: FC<Props> = ({ square }) => {
  const dispatch = useAppDispatch();
  const [ collected, drag ] = useDrag(() => ({
    type: 'piece',
    collect: monitor => {
      if (monitor.isDragging()) {
        dispatch(setCurrent(square.piece))
      }
      return {
        piece: square.piece,
        isDragging: monitor.isDragging(),
      }
    },
  }), [ square ])


  if (!square.piece) return null
  const { piece: { color, type } } = square;

  return <div
    ref={ drag }
    className={ classNames([ collected.isDragging ? styles.Dragging : '', styles.Piece, styles[`Piece${ color }${ type }`] ]) }
  />
}