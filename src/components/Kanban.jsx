import { useTareas } from '../hooks/useTareas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './Kanban.module.css'

const COLUMNAS = [
    { id: 'pendiente', label: 'Por hacer', emoji: '📋', color: '#3b4ef8' },
    { id: 'en_progreso', label: 'En progreso', emoji: '⚡', color: '#EF9F27' },
    { id: 'completada', label: 'Completado', emoji: '✅', color: '#1D9E75' },
]

export default function Kanban() {
    const { tareas, moverTarea, eliminarTarea, CATEGORIAS } = useTareas()

    function getTareasPorEstado(estado) {
        return tareas.filter(t => (t.estado || 'pendiente') === estado)
    }

    function getCategoria(id) {
        return CATEGORIAS?.find(c => c.id === id)
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Vista Kanban</h1>

            <div className={styles.board}>
                {COLUMNAS.map(col => {
                    const tareasCol = getTareasPorEstado(col.id)
                    return (
                        <div key={col.id} className={styles.columna}>

                            {/* Cabecera de columna */}
                            <div className={styles.colHeader}>
                                <span className={styles.colEmoji}>{col.emoji}</span>
                                <h2 className={styles.colTitulo}>{col.label}</h2>
                                <span
                                    className={styles.colCount}
                                    style={{ background: col.color + '22', color: col.color }}
                                >
                                    {tareasCol.length}
                                </span>
                            </div>

                            {/* Tarjetas */}
                            <div className={styles.tarjetas}>
                                {tareasCol.length === 0 && (
                                    <div className={styles.empty}>Sin tareas</div>
                                )}

                                {tareasCol.map(tarea => {
                                    const cat = getCategoria(tarea.categoria)
                                    const colActual = COLUMNAS.findIndex(c => c.id === col.id)

                                    return (
                                        <div key={tarea.id} className={styles.tarjeta}>

                                            {/* Texto */}
                                            <p className={styles.tarjetaTexto}>{tarea.texto}</p>

                                            {/* Subtareas */}
                                            {(tarea.subtareas || []).length > 0 && (
                                                <p className={styles.subtareaInfo}>
                                                    ✓ {(tarea.subtareas || []).filter(s => s.completada).length}/{(tarea.subtareas || []).length} subtareas
                                                </p>
                                            )}

                                            {/* Metadatos */}
                                            <div className={styles.tarjetaMeta}>
                                                {cat && (
                                                    <span
                                                        className={styles.catTag}
                                                        style={{ background: cat.bg, color: cat.color }}
                                                    >
                                                        {cat.label}
                                                    </span>
                                                )}
                                                <span className={`${styles.prioTag} ${styles[tarea.prioridad]}`}>
                                                    {tarea.prioridad}
                                                </span>
                                                {tarea.fechaLimite && (
                                                    <span className={styles.fechaTag}>
                                                        📅 {format(new Date(`${tarea.fechaLimite}T00:00:00`), 'dd MMM', { locale: es })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Botones de movimiento */}
                                            <div className={styles.tarjetaActions}>
                                                {colActual > 0 && (
                                                    <button
                                                        className={styles.moveBtn}
                                                        onClick={() => moverTarea(tarea.id, COLUMNAS[colActual - 1].id)}
                                                        title={`Mover a ${COLUMNAS[colActual - 1].label}`}
                                                    >
                                                        ← {COLUMNAS[colActual - 1].label}
                                                    </button>
                                                )}
                                                {colActual < COLUMNAS.length - 1 && (
                                                    <button
                                                        className={styles.moveBtn}
                                                        style={{ background: COLUMNAS[colActual + 1].color + '22', color: COLUMNAS[colActual + 1].color }}
                                                        onClick={() => moverTarea(tarea.id, COLUMNAS[colActual + 1].id)}
                                                        title={`Mover a ${COLUMNAS[colActual + 1].label}`}
                                                    >
                                                        {COLUMNAS[colActual + 1].label} →
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => eliminarTarea(tarea.id)}
                                                    aria-label="Eliminar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}