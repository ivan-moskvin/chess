import {NamingItems} from "./NamingItems";
import styles from './Naming.module.css';

export const Naming = () => {

  return <div className={styles.Naming}>
    <NamingItems type={'chars'} placement={'top'} />
    <NamingItems type={'digits'} placement={'right'} />
    <NamingItems type={'chars'} placement={'bottom'} />
    <NamingItems type={'digits'} placement={'left'} />
  </div>
}