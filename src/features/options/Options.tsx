import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectOptions } from "./optionsSlice"
import { t } from "i18next"
import styles from "./Options.module.css"
import { LANG } from "../../i18n/i18n"
import { newGame } from "../game/thunks"

export const Options = () => {
  const options = useAppSelector(selectOptions)
  const dispatch = useAppDispatch()

  return (
    <section className={ styles.options }>
      <h3>{ t<string>(LANG.OPTIONS) }</h3>
      <div>
        <button className={ styles.newGame } onClick={ () => dispatch(newGame()) }>{ t<string>(LANG.NEW_GAME) }</button>
      </div>
      {/*<div>*/ }
      {/*  <label htmlFor="ENABLE_ROTATION">{ t<string>(LANG.ENABLE_ROTATION) }</label>:*/ }
      {/*  <input id="ENABLE_ROTATION"*/ }
      {/*         type="checkbox"*/ }
      {/*         onChange={ () => dispatch(toggleRotation()) }*/ }
      {/*         checked={ options.ENABLE_ROTATION }/>*/ }
      {/*</div>*/ }
    </section>
  )
}
