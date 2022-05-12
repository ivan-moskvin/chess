import React, {useEffect} from 'react';
import {Board} from "./features/board/Board";
import styles from './App.module.css'
import {useAppDispatch} from "./app/hooks";
import {initSquares, initPieces} from "./features/board/boardSlice";
function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initSquares())
    dispatch(initPieces())

  }, [dispatch])

  return (
    <div className={styles.App}>
      <Board />
    </div>
  );
}

export default App;
