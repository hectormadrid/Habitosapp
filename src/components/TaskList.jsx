import { useState, useEffect, useCallback, useRef} from 'react'
import styles from './TaskList.module.css'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TaskList() {
  const [tareas, setTareas] = useState(() => {
    const guardadas = localStorage.getItem('tareas')
    return guardadas ? JSON.parse(guardadas) : []
  })

  const [input, setInput] = useState('')
  const [prioridad, setPrioridad] = useState('media')
  const [fechaLimite, setFechaLimite] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [horaTarea, setHoraTarea] = useState('')
  const [tieneHora, setTieneHora] = useState(false)
  const notificacionesEnviadas = useRef(new Set())

  // ── Persistencia ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  // ── Pedir permiso de notificaciones al montar ─────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── Revisar recordatorios ─────────────────────────────────
 const revisarRecordatorios = useCallback(() => {

  const ahora = new Date()
  tareas.forEach(tarea => {
    if(
      tarea.completada ||
      !tarea.fechaLimite ||
      !tarea.horaTarea
    ){
      return
    }
    const fechaHora = new Date(
      `${tarea.fechaLimite}T${tarea.horaTarea}:00`
    )
    const diferencia = fechaHora - ahora
    const dentroDelRango =
      diferencia <= 3600000 &&
      diferencia > 0

    if(
      dentroDelRango &&
      !notificacionesEnviadas.current.has(tarea.id)
    ){
      if(Notification.permission === "granted"){
        const minutos =
        Math.round(diferencia / 60000)

        new Notification(
          "🔔 Recordatorio de tarea",
          {
            body:
            `"${tarea.texto}" comienza en ${minutos} minutos`
          }
        )
      }
      // Guardamos que ya avisamos
      notificacionesEnviadas.current.add(tarea.id)
    }
  })
}, [tareas])


  // Revisar al montar y cada 30 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      revisarRecordatorios()
    }, 1000)

    const intervalo = setInterval(() => {
      revisarRecordatorios()
    }, 30000)

    return () => {
      clearTimeout(timeout)
      clearInterval(intervalo)
    }
  }, [revisarRecordatorios])

  // ── Acciones ──────────────────────────────────────────────
  function agregarTarea() {
    if (!input.trim()) return
    setTareas([...tareas, {
      id: Date.now(),
      texto: input,
      prioridad,
      fechaLimite,
      horaTarea: tieneHora ? horaTarea : null,
      completada: false,
      notificado: false,   // ← campo nuevo para evitar repetir la notificación
    }])
    setInput('')
    setPrioridad('media')
    setFechaLimite('')
    setHoraTarea('')
    setTieneHora(false)
  }

  function toggleTarea(id) {
    setTareas(tareas.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t
    ))
  }

  function eliminarTarea(id) {
    setTareas(tareas.filter(t => t.id !== id))
  }

  function estaVencida(tarea) {
    if (!tarea.fechaLimite || tarea.completada) return false
    const fechaVencimiento = tarea.horaTarea
      ? new Date(`${tarea.fechaLimite}T${tarea.horaTarea}`)
      : new Date(`${tarea.fechaLimite}T23:59:59`)
    return fechaVencimiento < new Date()
  }

  function filtrarTareas(lista) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (filtro === 'pendientes') return lista.filter(t => !t.completada)
    if (filtro === 'completadas') return lista.filter(t => t.completada)
    if (filtro === 'hoy') return lista.filter(t => {
      if (!t.fechaLimite) return false
      return new Date(`${t.fechaLimite}T00:00:00`).getTime() === hoy.getTime()
    })
    if (filtro === 'vencidas') return lista.filter(t => {
      if (!t.fechaLimite || t.completada) return false
      return new Date(`${t.fechaLimite}T00:00:00`) < hoy
    })
    return lista
  }

  function ordenarTareas(lista) {
    const pesoPrioridad = { alta: 1, media: 2, baja: 3 }
    return [...lista].sort((a, b) => {
      if (a.fechaLimite && b.fechaLimite) {
        const diff = new Date(a.fechaLimite) - new Date(b.fechaLimite)
        if (diff !== 0) return diff
      }
      if (a.fechaLimite && !b.fechaLimite) return -1
      if (!a.fechaLimite && b.fechaLimite) return 1
      return pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad]
    })
  }

  const tareasFiltradas = ordenarTareas(filtrarTareas(tareas))
  const pendientes = tareasFiltradas.filter(t => !t.completada)
  const completadas = tareasFiltradas.filter(t => t.completada)

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <p className={styles.progress}>
        {pendientes.length} pendientes · {completadas.length} completadas
      </p>

      <div className={styles.filtros}>
        {[
          { valor: 'todas', icono: '📋', label: 'Todas' },
          { valor: 'pendientes', icono: '⏳', label: 'Pendientes' },
          { valor: 'completadas', icono: '✅', label: 'Completadas' },
          { valor: 'hoy', icono: '📅', label: 'Hoy' },
          { valor: 'vencidas', icono: '⚠️', label: 'Vencidas' },
        ].map(f => (
          <button
            key={f.valor}
            className={`${styles.filtroBtn} ${filtro === f.valor ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.icono} {f.label}
          </button>
        ))}
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Nueva tarea..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && agregarTarea()}
        />
        <input
          className={styles.input}
          type="date"
          value={fechaLimite}
          onChange={e => setFechaLimite(e.target.value)}
        />
        <label className={styles.checkHora}>
          <input
            type="checkbox"
            checked={tieneHora}
            onChange={e => setTieneHora(e.target.checked)}
          />
          Agregar hora
        </label>
        {tieneHora && (
          <input
            className={styles.input}
            type="time"
            value={horaTarea}
            onChange={e => setHoraTarea(e.target.value)}
          />
        )}
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
            {tarea.fechaLimite && (
              <span className={styles.fecha}>
                📅 {format(new Date(`${tarea.fechaLimite}T00:00:00`), 'dd MMM', { locale: es })}
              </span>
            )}
            {tarea.horaTarea && (
              <span className={styles.fecha}>⏰ {tarea.horaTarea}</span>
            )}
            {estaVencida(tarea) && (
              <span className={styles.vencida}>⚠️ Vencida</span>
            )}
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
                {tarea.fechaLimite && (
                  <span className={styles.fecha}>
                    📅 {format(new Date(`${tarea.fechaLimite}T00:00:00`), 'dd MMM', { locale: es })}
                  </span>
                )}
                {tarea.horaTarea && (
                  <span className={styles.fecha}>⏰ {tarea.horaTarea}</span>
                )}
                <button className={styles.deleteBtn} onClick={() => eliminarTarea(tarea.id)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}