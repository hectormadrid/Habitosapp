import styles from './HabitList.module.css'

export default function HabitItem({ habito, onToggle, onEliminar }) {
    return (
        <li className={styles.item}>
            <input
                className={styles.checkbox}
                type="checkbox"
                checked={habito.completado}
                onChange={() => onToggle(habito.id)}
            />
            <span className={`${styles.nombre} ${habito.completado ? styles.nombreCompletado : ''}`}>
                {habito.nombre}
            </span>
            <button className={styles.deleteBtn} onClick={() => onEliminar(habito.id)}>✕</button>
        </li>
    )
}