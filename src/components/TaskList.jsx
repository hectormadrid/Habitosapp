import { useState, useEffect, useCallback } from 'react'
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
  const [horaRecordatorio, setHoraRecordatorio] = useState('')
  const [anticipacion, setAnticipacion] = useState(1)

  const revisarRecordatorios = useCallback(() => {

    const ahora = new Date()


    tareas.forEach(tarea => {

      if (
        tarea.completada ||
        !tarea.fechaLimite ||
        !tarea.horaRecordatorio
      ) {
        return
      }


      const fechaHora = new Date(
        `${tarea.fechaLimite}T${tarea.horaRecordatorio}`
      )


      fechaHora.setHours(
        fechaHora.getHours() - tarea.anticipacion
      )


      const diferencia = fechaHora - ahora


      if (
        diferencia <= 60000 &&
        diferencia > 0
      ) {

        new Notification(
          "🔔 Recordatorio",
          {
            body:
              `${tarea.texto} vence en ${tarea.anticipacion} hora(s)`
          }
        )

      }

    })

  }, [tareas])
  useEffect(() => {

    if ("Notification" in window) {

      if (Notification.permission !== "granted") {

        Notification.requestPermission()

      }

    }

  }, [])
  useEffect(() => {

    const intervalo = setInterval(() => {

      revisarRecordatorios()

    }, 60000)


    return () => clearInterval(intervalo)


  }, [revisarRecordatorios])

  useEffect(() => {

    localStorage.setItem('tareas', JSON.stringify(tareas))

  }, [tareas])

  function agregarTarea() {
    if (!input.trim()) return
    setTareas([...tareas, {
      id: Date.now(),
      texto: input,
      prioridad,
      fechaLimite,
      horaRecordatorio,
      anticipacion,
      completada: false
    }])
    setInput('')
    setPrioridad('media')
    setFechaLimite('')
    setHoraRecordatorio('')
    setAnticipacion(1)
  }

  function toggleTarea(id) {
    setTareas(tareas.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t
    ))
  }

  function eliminarTarea(id) {
    setTareas(tareas.filter(t => t.id !== id))
  }

  function ordenarTareas(lista) {
    const pesoPrioridad = {
      alta: 1,
      media: 2,
      baja: 3
    }

    return [...lista].sort((a, b) => {

      // Primero fechas
      if (a.fechaLimite && b.fechaLimite) {
        const diferencia =
          new Date(a.fechaLimite) -
          new Date(b.fechaLimite)

        if (diferencia !== 0)
          return diferencia
      }

      // Con fecha antes que sin fecha
      if (a.fechaLimite && !b.fechaLimite)
        return -1

      if (!a.fechaLimite && b.fechaLimite)
        return 1


      // Luego prioridad
      return pesoPrioridad[a.prioridad] -
        pesoPrioridad[b.prioridad]

    })
  }

  const tareasFiltradas = ordenarTareas(
    filtrarTareas(tareas)
  )

  const pendientes = tareasFiltradas.filter(
    t => !t.completada
  )

  const completadas = tareasFiltradas.filter(
    t => t.completada
  )
  function estaVencida(tarea) {
    if (!tarea.fechaLimite || tarea.completada) return false

    return new Date(`${tarea.fechaLimite}T00:00:00`) < new Date()
  }


  function filtrarTareas(lista) {

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (filtro === 'pendientes') {
      return lista.filter(t => !t.completada)
    }


    if (filtro === 'completadas') {
      return lista.filter(t => t.completada)
    }


    if (filtro === 'hoy') {
      return lista.filter(t => {

        if (!t.fechaLimite) return false

        const fecha = new Date(
          `${t.fechaLimite}T00:00:00`
        )

        return fecha.getTime() === hoy.getTime()
      })
    }


    if (filtro === 'vencidas') {
      return lista.filter(t => {

        if (!t.fechaLimite || t.completada)
          return false

        return new Date(
          `${t.fechaLimite}T00:00:00`
        ) < hoy
      })
    }


    return lista
  }
  return (
    <div className={styles.container}>
      <p className={styles.progress}>
        {pendientes.length} pendientes · {completadas.length} completadas
      </p>
      <div className={styles.filtros}>

        <button
          className={styles.filtroBtn}
          onClick={() => setFiltro('todas')}
        >
          📋 Todas
        </button>

        <button
          className={styles.filtroBtn}
          onClick={() => setFiltro('pendientes')}
        >
          ⏳ Pendientes
        </button>

        <button
          className={styles.filtroBtn}
          onClick={() => setFiltro('completadas')}
        >
          ✅ Completadas
        </button>

        <button
          className={styles.filtroBtn}
          onClick={() => setFiltro('hoy')}
        >
          📅 Hoy
        </button>

        <button
          className={styles.filtroBtn}
          onClick={() => setFiltro('vencidas')}
        >
          ⚠️ Vencidas
        </button>

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
        <input
          className={styles.input}
          type="time"
          value={horaRecordatorio}
          onChange={e => setHoraRecordatorio(e.target.value)}
        />
        <select
          className={styles.select}
          value={anticipacion}
          onChange={e => setAnticipacion(Number(e.target.value))}
        >

          <option value="1">
            ⏰ 1 hora antes
          </option>

          <option value="2">
            ⏰ 2 horas antes
          </option>

        </select>
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
                📅 {format(
                  new Date(`${tarea.fechaLimite}T00:00:00`),
                  'dd MMM',
                  { locale: es }
                )}
              </span>
            )}

            {estaVencida(tarea) && (
              <span className={styles.vencida}>
                ⚠️ Vencida
              </span>
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
                    📅 {format(
                      new Date(`${tarea.fechaLimite}T00:00:00`),
                      'dd MMM',
                      { locale: es }
                    )}
                  </span>
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