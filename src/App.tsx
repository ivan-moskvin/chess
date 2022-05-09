import React, {useEffect} from 'react';
import {Board} from "./features/board/Board";
import styles from './App.module.css'
import {useAppDispatch} from "./app/hooks";
import {setInitialCells, setInitialPieces} from "./features/board/boardSlice";
function App() {
  const dispatch = useAppDispatch();


  useEffect(() => {
    dispatch(setInitialCells())
    dispatch(setInitialPieces())

  }, [dispatch])

  return (
    <div className={styles.App}>
      <Board />
    </div>
  );
}

export default App;
