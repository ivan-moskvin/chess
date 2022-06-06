import "react-toastify/dist/ReactToastify.css"
import "./i18n/i18n"
import React, { useEffect } from "react"
import { Board } from "./features/board/Board"
import styles from "./App.module.css"
import { useAppDispatch } from "./app/hooks"
import { ToastContainer } from "react-toastify"
import storage from "redux-persist/lib/storage"
import { PERSIST_ROOT_NAME } from "./app/constants"
import { newGame } from "./features/game/thunks"
import { getNotificationConfig } from "./features/notify/utils"

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    storage.getItem(`persist:${ PERSIST_ROOT_NAME }`)
      .then((r) => r ? JSON.parse(r) : {})
      .then((data) => {
        // Start new game if no persisted data exists
        if (!data?.board) return dispatch(newGame())

        const squares = JSON.parse(data.board)?.squares

        if (!squares.length) {
          dispatch(newGame())
        }
      })

  }, [ dispatch ])

  return (
    <div className={ styles.app }>
      <Board/>
      <ToastContainer { ...getNotificationConfig() }/>
    </div>
  )
}

export default App
