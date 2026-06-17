import { useState, useEffect } from 'react'
import styles from './TaskList.module.css'

export default function TaskList() {
  const [tareas, setTareas] = useState(() => {
    const guardadas = localStorage.getItem('tareas')
    return guardadas ? JSON.parse(guardadas) : []
  })

  const [input, setInput] = useState('')
  const [prioridad, setPrioridad] = useState('media')

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  function agregarTarea() {
    if (!input.trim()) return
    setTareas([...tareas, {
      id: Date.now(),
      texto: input,
      prioridad,
      completada: false,
    }])
    setInput('')
    setPrioridad('media')
  }

  function toggleTarea(id) {
    setTareas(tareas.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t
    ))
  }

  function eliminarTarea(id) {
    setTareas(tareas.filter(t => t.id !== id))
  }

  const pendientes  = tareas.filter(t => !t.completada)
  const completadas = tareas.filter(t => t.completada)

  return (
    <div className={styles.container}>
      <p className={styles.progress}>
        {pendientes.length} pendientes · {completadas.length} completadas
      </p>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Nueva tarea..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && agregarTarea()}
        />
        <select
          className={styles.select}
          value={prioridad}
          onChange={e => setPrioridad(e.target.value)}
        >
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Baja</option>
        </select>
        <button className={styles.addBtn} onClick={agregarTarea}>Agregar</button>
      </div>

      <ul className={styles.list}>
        {pendientes.map(tarea => (
          <li key={tarea.id} className={styles.item}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={tarea.completada}
              onChange={() => toggleTarea(tarea.id)}
            />
            <span className={styles.texto}>{tarea.texto}</span>
            <span className={`${styles.badge} ${styles[tarea.prioridad]}`}>
              {tarea.prioridad}
            </span>
            <button className={styles.deleteBtn} onClick={() => eliminarTarea(tarea.id)}>✕</button>
          </li>
        ))}
      </ul>

      {completadas.length > 0 && (
        <div className={styles.completadas}>
          <p className={styles.completadasLabel}>Completadas ({completadas.length})</p>
          <ul className={styles.list}>
            {completadas.map(tarea => (
              <li key={tarea.id} className={`${styles.item} ${styles.itemCompletado}`}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={tarea.completada}
                  onChange={() => toggleTarea(tarea.id)}
                />
                <span className={`${styles.texto} ${styles.textoCompletado}`}>{tarea.texto}</span>
                <button className={styles.deleteBtn} onClick={() => eliminarTarea(tarea.id)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}