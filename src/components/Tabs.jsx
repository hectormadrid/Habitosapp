import styles from './Tabs.module.css'

export default function Tabs({ activa, onChange }) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.tab} ${activa === 'habitos' ? styles.tabActiva : ''}`}
        onClick={() => onChange('habitos')}
      >
        Hábitos
      </button>
      <button
        className={`${styles.tab} ${activa === 'tareas' ? styles.tabActiva : ''}`}
        onClick={() => onChange('tareas')}
      >
        Tareas
      </button>
    </nav>
  )
}