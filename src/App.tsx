import "react-toastify/dist/ReactToastify.css"
import "./i18n/i18n"
import React, { useEffect } from "react"
import { Board } from "./features/board/Board"
import styles from "./App.module.css"
import { useAppDispatch } from "./app/hooks"
import { initSquares } from "./features/board/boardSlice"
import { ToastContainer } from "react-toastify"
import { initHistory } from "./features/history/thunks";
import { initPieces } from "./features/board/thunks";


function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initSquares())
    dispatch(initPieces())
    dispatch(initHistory())

  }, [ dispatch ])

  return (
    <div className={ styles.app }>
      <Board/>
      <ToastContainer
        position="bottom-right"
        autoClose={ 5000 }
        hideProgressBar={ false }
        rtl={ false }
        theme="dark"
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
