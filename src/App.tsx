import React, {useEffect} from 'react';
import {Board} from "./features/board/Board";
import styles from './App.module.css'
import {useAppDispatch} from "./app/hooks";
import {initCells, initPieces} from "./features/board/boardSlice";
function App() {
  const dispatch = useAppDispatch();


  useEffect(() => {
    dispatch(initCells())
    dispatch(initPieces())

  }, [dispatch])

  return (
    <div className={styles.App}>
      <Board />
    </div>
  );
}

export default App;
