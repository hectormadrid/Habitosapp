import { useState } from 'react'
import AyudaModal from './AyudaModal'
import styles from './Tabs.module.css'

export default function Tabs({ activa, onChange }) {
    const [mostrarAyuda, setMostrarAyuda] = useState(false)

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.tabsGroup}>
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
                        Estadísticas
                    </button>
                    <button
                        className={`${styles.tab} ${activa === 'calendario' ? styles.tabActiva : ''}`}
                        onClick={() => onChange('calendario')}
                    >
                        Calendario
                    </button>
                    <button
                        className={`${styles.tab} ${activa === 'pomodoro' ? styles.tabActiva : ''}`}
                        onClick={() => onChange('pomodoro')}
                    >
                        Pomodoro
                    </button>
                    <button
                        className={`${styles.tab} ${activa === 'kanban' ? styles.tabActiva : ''}`}
                        onClick={() => onChange('kanban')}
                    >
                        Kanban
                    </button>
                </div>

                <button
                    className={styles.ayudaBtn}
                    onClick={() => setMostrarAyuda(true)}
                    aria-label="Ayuda"
                >
                    ?
                </button>
            </nav>

            {mostrarAyuda && (
                <AyudaModal seccion={activa} onClose={() => setMostrarAyuda(false)} />
            )}
        </>
    )
}