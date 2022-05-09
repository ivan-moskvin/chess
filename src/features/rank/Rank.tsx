import {ISquare} from "../square/squareSlice";
import {Square} from "../square/Square";
import {FC} from "react";
import styles from './Rank.module.css';

interface Props {
  rank: ISquare[]
}

export const Rank: FC<Props> = ({ rank }) => {
  return <div className={styles.Rank}>
    {
      rank.map((square, i) => <Square key={i} square={square} />)
    }
  </div>
}