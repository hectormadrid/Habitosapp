import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTareas } from '../hooks/useTareas'
import styles from './TaskList.module.css'

export default function TaskList() {
  const {
    tareas,

    busqueda,
    setBusqueda,

    agregarTarea,
    editarTarea,
    toggleTarea,
    eliminarTarea,

    filtrarTareas,
    buscarTareas,
    ordenarTareas,

    estaVencida,
    formatAnticipacion,
  } = useTareas();

  //  Estado local de UI 
  const [input, setInput] = useState('')
  const [prioridad, setPrioridad] = useState('media')
  const [fechaLimite, setFechaLimite] = useState('')
  const [horaTarea, setHoraTarea] = useState('')
  const [tieneHora, setTieneHora] = useState(false)
  const [anticipacion, setAnticipacion] = useState(60)
  const [filtro, setFiltro] = useState('todas')

  const [editando, setEditando] = useState(null)
  const [editTexto, setEditTexto] = useState('')
  const [editPrioridad, setEditPrioridad] = useState('media')
  const [editFecha, setEditFecha] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editTieneHora, setEditTieneHora] = useState(false)
  const [editAnticipacion, setEditAnticipacion] = useState(60)

  //  Handlers 

  function handleAgregar() {
    agregarTarea({ texto: input, prioridad, fechaLimite, horaTarea, anticipacion, tieneHora })
    setInput('')
    setPrioridad('media')
    setFechaLimite('')
    setHoraTarea('')
    setAnticipacion(60)
    setTieneHora(false)
  }

  function abrirEditar(tarea) {
    setEditando(tarea)
    setEditTexto(tarea.texto)
    setEditPrioridad(tarea.prioridad)
    setEditFecha(tarea.fechaLimite || '')
    setEditHora(tarea.horaTarea || '')
    setEditTieneHora(!!tarea.horaTarea)
    setEditAnticipacion(tarea.anticipacion || 60)
  }

  function guardarEdicion() {
    if (!editTexto.trim()) return
    editarTarea(editando.id, {
      texto: editTexto,
      prioridad: editPrioridad,
      fechaLimite: editFecha,
      horaTarea: editTieneHora ? editHora : null,
      anticipacion: editTieneHora ? editAnticipacion : null,
    })
    setEditando(null)
  }

  //  Datos calculados 

  const tareasFiltradas = ordenarTareas(
    buscarTareas(
      filtrarTareas(tareas, filtro)
    )
  );
  const pendientes = tareasFiltradas.filter(t => !t.completada)
  const completadas = tareasFiltradas.filter(t => t.completada)

  // Render 

  return (
    <div className={styles.container}>
      <p className={styles.progress}>
        {pendientes.length} pendientes · {completadas.length} completadas
      </p>
      <div className={styles.searchContainer}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="🔍 Buscar tareas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <span className={styles.searchInfo}>
          {tareasFiltradas.length} resultado{tareasFiltradas.length !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Filtros */}
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

      {/* Formulario */}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Nueva tarea..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAgregar()}
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
          <>
            <input
              className={styles.input}
              type="time"
              value={horaTarea}
              onChange={e => setHoraTarea(e.target.value)}
            />
            <select
              className={styles.select}
              value={anticipacion}
              onChange={e => setAnticipacion(Number(e.target.value))}
            >
              <option value={5}>⏰ 5 min antes</option>
              <option value={10}>⏰ 10 min antes</option>
              <option value={15}>⏰ 15 min antes</option>
              <option value={30}>⏰ 30 min antes</option>
              <option value={60}>⏰ 1 hora antes</option>
              <option value={120}>⏰ 2 horas antes</option>
              <option value={1440}>⏰ 1 día antes</option>
            </select>
          </>
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
        <button className={styles.addBtn} onClick={handleAgregar}>Agregar</button>
      </div>

      {/* Lista pendientes */}
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
            {tarea.anticipacion && (
              <span className={styles.fecha}>🔔 {formatAnticipacion(tarea.anticipacion)}</span>
            )}
            {estaVencida(tarea) && (
              <span className={styles.vencida}>⚠️ Vencida</span>
            )}
            <span className={`${styles.badge} ${styles[tarea.prioridad]}`}>
              {tarea.prioridad}
            </span>
            <button className={styles.editTareaBtn} onClick={() => abrirEditar(tarea)} aria-label="Editar">
              <i className="ti ti-pencil" aria-hidden="true" />
            </button>
            <button className={styles.deleteBtn} onClick={() => eliminarTarea(tarea.id)}>✕</button>
          </li>
        ))}
        {tareasFiltradas.length === 0 && (
          <div className={styles.emptySearch}>
            🔍 No se encontraron tareas
          </div>
        )}
      </ul>

      {/* Lista completadas */}
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

      {/* Modal edición */}
      {editando && (
        <div className={styles.modalBackdrop} onClick={e => e.target === e.currentTarget && setEditando(null)}>
          <div className={styles.modalEditar}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitulo}>Editar tarea</h2>
              <button className={styles.modalCerrar} onClick={() => setEditando(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrupo}>
                <label className={styles.modalLabel}>Tarea</label>
                <input
                  className={styles.input}
                  type="text"
                  value={editTexto}
                  onChange={e => setEditTexto(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guardarEdicion()}
                  autoFocus
                />
              </div>
              <div className={styles.modalGrupo}>
                <label className={styles.modalLabel}>Fecha límite</label>
                <input
                  className={styles.input}
                  type="date"
                  value={editFecha}
                  onChange={e => setEditFecha(e.target.value)}
                />
              </div>
              <div className={styles.modalGrupo}>
                <label className={styles.checkHora}>
                  <input
                    type="checkbox"
                    checked={editTieneHora}
                    onChange={e => setEditTieneHora(e.target.checked)}
                  />
                  Agregar hora
                </label>
              </div>
              {editTieneHora && (
                <>
                  <div className={styles.modalGrupo}>
                    <label className={styles.modalLabel}>Hora</label>
                    <input
                      className={styles.input}
                      type="time"
                      value={editHora}
                      onChange={e => setEditHora(e.target.value)}
                    />
                  </div>
                  <div className={styles.modalGrupo}>
                    <label className={styles.modalLabel}>Recordatorio</label>
                    <select
                      className={styles.select}
                      style={{ width: '100%' }}
                      value={editAnticipacion}
                      onChange={e => setEditAnticipacion(Number(e.target.value))}
                    >
                      <option value={5}>⏰ 5 min antes</option>
                      <option value={10}>⏰ 10 min antes</option>
                      <option value={15}>⏰ 15 min antes</option>
                      <option value={30}>⏰ 30 min antes</option>
                      <option value={60}>⏰ 1 hora antes</option>
                      <option value={120}>⏰ 2 horas antes</option>
                      <option value={1440}>⏰ 1 día antes</option>
                    </select>
                  </div>
                </>
              )}
              <div className={styles.modalGrupo}>
                <label className={styles.modalLabel}>Prioridad</label>
                <select
                  className={styles.select}
                  style={{ width: '100%' }}
                  value={editPrioridad}
                  onChange={e => setEditPrioridad(e.target.value)}
                >
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.deleteBtn}
                style={{ marginRight: 'auto' }}
                onClick={() => { eliminarTarea(editando.id); setEditando(null) }}
              >
                🗑️ Eliminar
              </button>
              <button className={styles.filtroBtn} onClick={() => setEditando(null)}>
                Cancelar
              </button>
              <button className={styles.addBtn} onClick={guardarEdicion} disabled={!editTexto.trim()}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}