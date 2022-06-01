import "./i18n/i18n"
import React, { useEffect } from "react"
import { Board } from "./features/board/Board"
import styles from "./App.module.css"
import { useAppDispatch } from "./app/hooks"
import { initPieces, initSquares } from "./features/board/boardSlice"
import { historySnapshot } from "./features/history/historySlice"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"


function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initSquares())
    dispatch(initPieces())
    dispatch(historySnapshot("init"))

  }, [ dispatch ])

  return (
    <div className={ styles.app }>
      <Board/>
      <ToastContainer
        position="bottom-right"
        autoClose={ 5000 }
        hideProgressBar={ false }
        rtl={ false }
        closeOnClick
        newestOnTop
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
