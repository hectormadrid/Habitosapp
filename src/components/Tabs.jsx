import styles from './Tabs.module.css'
// Componente de pestañas para cambiar entre "Hábitos" y "Tareas"
export default function Tabs({ activa, onChange }) {
    // Renderiza dos botones para las pestañas, aplicando estilos según la pestaña activa
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
              <button
                className={`${styles.tab} ${activa === 'estadisticas' ? styles.tabActiva : ''}`}
                onClick={() => onChange('estadisticas')}
            >
                Estadisticas
            </button>
        </nav>
    )
}