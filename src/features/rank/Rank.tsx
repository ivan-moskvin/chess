import { Square } from "../square/Square"
import { FC } from "react"
import styles from "./Rank.module.css"
import { ISquare } from "../square/types"

interface Props {
  rank: ISquare[]
}

export const Rank: FC<Props> = ({ rank }) => {
  return <div className={ styles.Rank }>
    {
      rank.map((square) => <Square key={ square.position } square={ square }/>)
    }
  </div>
}
