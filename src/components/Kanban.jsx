import { useTareas } from '../hooks/useTareas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './Kanban.module.css'
import { useState } from 'react'


const COLUMNAS = [
    { id: 'pendiente', label: 'Por hacer', emoji: '📋', color: '#3b4ef8' },
    { id: 'en_progreso', label: 'En progreso', emoji: '⚡', color: '#EF9F27' },
    { id: 'completada', label: 'Completado', emoji: '✅', color: '#1D9E75' },
]

export default function Kanban() {
    const { tareas, moverTarea, eliminarTarea, CATEGORIAS } = useTareas()
    const [tareaDetalle, setTareaDetalle] = useState(null)
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
                                                    className={styles.infoBtn}
                                                    onClick={() => setTareaDetalle(tarea)}
                                                    aria-label="Ver detalles"
                                                    title="Ver detalles"
                                                >
                                                    <i className="ti ti-info-circle" aria-hidden="true" />
                                                </button>
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
                            {/* Modal de detalles */}
                            {tareaDetalle && (
                                <div className={styles.modalBackdrop} onClick={e => e.target === e.currentTarget && setTareaDetalle(null)}>
                                    <div className={styles.modal}>

                                        <div className={styles.modalHeader}>
                                            <h3 className={styles.modalTitulo}>{tareaDetalle.texto}</h3>
                                            <button className={styles.cerrarBtn} onClick={() => setTareaDetalle(null)}>✕</button>
                                        </div>

                                        <div className={styles.modalBody}>

                                            {/* Prioridad */}
                                            <div className={styles.detalleRow}>
                                                <span className={styles.detalleLabel}>Prioridad</span>
                                                <span className={`${styles.prioTag} ${styles[tareaDetalle.prioridad]}`}>
                                                    {tareaDetalle.prioridad}
                                                </span>
                                            </div>

                                            {/* Categoría */}
                                            {tareaDetalle.categoria && (() => {
                                                const cat = getCategoria(tareaDetalle.categoria)
                                                return cat ? (
                                                    <div className={styles.detalleRow}>
                                                        <span className={styles.detalleLabel}>Categoría</span>
                                                        <span className={styles.catTag} style={{ background: cat.bg, color: cat.color }}>
                                                            {cat.label}
                                                        </span>
                                                    </div>
                                                ) : null
                                            })()}

                                            {/* Estado */}
                                            <div className={styles.detalleRow}>
                                                <span className={styles.detalleLabel}>Estado</span>
                                                <span className={styles.detalleValor}>
                                                    {COLUMNAS.find(c => c.id === (tareaDetalle.estado || 'pendiente'))?.emoji}{' '}
                                                    {COLUMNAS.find(c => c.id === (tareaDetalle.estado || 'pendiente'))?.label}
                                                </span>
                                            </div>

                                            {/* Fecha límite */}
                                            {tareaDetalle.fechaLimite && (
                                                <div className={styles.detalleRow}>
                                                    <span className={styles.detalleLabel}>Fecha límite</span>
                                                    <span className={styles.detalleValor}>
                                                        📅 {format(new Date(`${tareaDetalle.fechaLimite}T00:00:00`), "dd 'de' MMMM yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Hora */}
                                            {tareaDetalle.horaTarea && (
                                                <div className={styles.detalleRow}>
                                                    <span className={styles.detalleLabel}>Hora</span>
                                                    <span className={styles.detalleValor}>⏰ {tareaDetalle.horaTarea}</span>
                                                </div>
                                            )}

                                            {/* Recordatorio */}
                                            {tareaDetalle.anticipacion && (
                                                <div className={styles.detalleRow}>
                                                    <span className={styles.detalleLabel}>Recordatorio</span>
                                                    <span className={styles.detalleValor}>
                                                        🔔 {tareaDetalle.anticipacion < 60
                                                            ? `${tareaDetalle.anticipacion} min antes`
                                                            : tareaDetalle.anticipacion === 1440
                                                                ? '1 día antes'
                                                                : `${tareaDetalle.anticipacion / 60}h antes`}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Subtareas */}
                                            {(tareaDetalle.subtareas || []).length > 0 && (
                                                <div className={styles.detalleSubtareas}>
                                                    <span className={styles.detalleLabel}>Subtareas</span>
                                                    <ul className={styles.subtareasList}>
                                                        {tareaDetalle.subtareas.map(s => (
                                                            <li key={s.id} className={styles.subtareaItem}>
                                                                <span className={`${styles.subtareaDot} ${s.completada ? styles.subtareaDotDone : ''}`}>
                                                                    {s.completada ? '✓' : ''}
                                                                </span>
                                                                <span style={{ textDecoration: s.completada ? 'line-through' : 'none', color: s.completada ? 'var(--color-text-hint)' : 'var(--color-text)' }}>
                                                                    {s.texto}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Descripción */}
                                            {tareaDetalle.descripcion && (
                                                <div className={styles.detalleRow}>
                                                    <span className={styles.detalleLabel}>Descripción</span>
                                                    <span className={styles.detalleValor}>{tareaDetalle.descripcion}</span>
                                                </div>
                                            )}

                                        </div>

                                        <div className={styles.modalFooter}>
                                            <button className={styles.cerrarBtnFooter} onClick={() => setTareaDetalle(null)}>
                                                Cerrar
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}