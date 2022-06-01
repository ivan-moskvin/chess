import { FC } from "react";
import styles from "./Naming.module.css"
import classNames from "classnames";

interface Props {
  type: "digits" | "chars"
  placement: "top" | "right" | "bottom" | "left"
}

export const NamingItems: FC<Props> = ({ type, placement }) => {
  const getDigits = (): string[] => {
    let digit = 9
    const result = []

    while (digit-- > 1) {
      result.push(digit + "")
    }

    return result
  }

  const getChars = (): string[] => {
    let charCode = 97
    let count = 1
    const result = []

    while (count++ < 9) {
      result.push(String.fromCharCode(charCode++))
    }

    return result
  }

  return <ul className={ classNames([
    styles.items, type === "digits" ? styles.digits : styles.chars,
    styles[`items--${ placement }`]
  ]) }>
    { type === "digits"
      ? getDigits().map((digit, i) =>
        <li key={ i } className={ classNames([ styles.item, styles.digit ]) }>{ digit }</li>)
      : getChars().map((char, i) =>
        <li key={ i } className={ classNames([ styles.item, styles.char ]) }>{ char }</li>)
    }
  </ul>
}