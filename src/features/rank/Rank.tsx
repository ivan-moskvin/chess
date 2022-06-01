import { FC } from "react"
import styles from "./Rank.module.css"
import { Square } from "../square/types"
import { SquareComponent } from "../square/SquareComponent";

interface Props {
  rank: Square[]
}

export const Rank: FC<Props> = ({ rank }) => {
  return <div className={ styles.rank }>
    {
      rank.map((square) => <SquareComponent key={ square.position } square={ square }/>)
    }
  </div>
}
