import { useState } from 'react'
import { dateKey } from '../utils'
import styles from './Calendario.module.css'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Calendario({ habits, completions, notas, setNotas, tareas }) {
  const hoy = new Date()

  const [mes, setMes] = useState(hoy.getMonth())
  const [año, setAño] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [notaTexto, setNotaTexto] = useState('')

  // ── Helpers ──────────────────────────────────────────────
  function getTareasDia(dk) {
    return tareas.filter(t => t.fechaLimite && t.fechaLimite === dk)
  }
  function getDiasDelMes(m, a) {
    const totalDias = new Date(a, m + 1, 0).getDate()
    return Array.from({ length: totalDias }, (_, i) => {
      return new Date(a, m, i + 1)
    })
  }

  function getOffset(m, a) {
    const primerDia = new Date(a, m, 1).getDay()
    return primerDia === 0 ? 6 : primerDia - 1
  }

  function getPorcentaje(dk) {
    if (!habits.length) return 0
    const completados = habits.filter(h => completions[`${h.id}_${dk}`]).length
    return Math.round((completados / habits.length) * 100)
  }

  function getColorDia(dk, esFuturo) {
    if (esFuturo) return null
    const pct = getPorcentaje(dk)
    if (pct === 0) return { bg: 'var(--color-pct-0)', fg: 'var(--color-pct-text-0)' }
    if (pct <= 40) return { bg: 'var(--color-pct-1)', fg: 'var(--color-pct-text-1)' }
    if (pct <= 70) return { bg: 'var(--color-pct-2)', fg: 'var(--color-pct-text-2)' }
    return { bg: 'var(--color-pct-3)', fg: 'var(--color-pct-text-3)' }
  }

  function getHabitosDelDia(dk) {
    return habits.map(h => ({
      ...h,
      completado: !!completions[`${h.id}_${dk}`]
    }))
  }

  // ── Navegación de mes ─────────────────────────────────────

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAño(a => a - 1) }
    else setMes(m => m - 1)
  }

  function mesSiguiente() {
    if (mes === 11) { setMes(0); setAño(a => a + 1) }
    else setMes(m => m + 1)
  }

  // ── Seleccionar día ───────────────────────────────────────

  function seleccionarDia(dk) {
    setDiaSeleccionado(dk)
    setNotaTexto(notas[dk] || '')
  }

  function guardarNota() {
    if (!diaSeleccionado) return
    setNotas(prev => ({ ...prev, [diaSeleccionado]: notaTexto }))
  }

  function cerrarPanel() {
    setDiaSeleccionado(null)
    setNotaTexto('')
  }

  // ── Render ────────────────────────────────────────────────

  const dias = getDiasDelMes(mes, año)
  const offset = getOffset(mes, año)
  const todayKey = dateKey(hoy)

  return (
    <div className={styles.container}>
      <div className={styles.layout}>

        {/* ── Calendario ── */}
        <div className={styles.calendarSection}>

          {/* Navegación */}
          <div className={styles.nav}>
            <button className={styles.navBtn} onClick={mesAnterior}>←</button>
            <h2 className={styles.mesLabel}>{MESES[mes]} {año}</h2>
            <button className={styles.navBtn} onClick={mesSiguiente}>→</button>
          </div>

          {/* Nombres de días */}
          <div className={styles.grid}>
            {DIAS_SEMANA.map(d => (
              <div key={d} className={styles.dayName}>{d}</div>
            ))}

            {/* Espacios vacíos */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Días */}
            {dias.map(dia => {
              const dk = dateKey(dia)
              const esFuturo = dia > hoy && dk !== todayKey
              const esHoy = dk === todayKey
              const colors = getColorDia(dk, esFuturo)
              const bg = colors ? colors.bg : undefined
              const fg = colors ? colors.fg : 'var(--color-text)'
              const tieneNota = !!notas[dk]
              const seleccionado = diaSeleccionado === dk

              return (
                <div
                  key={dk}
                  className={`
                  ${styles.dia}
                  ${esHoy ? styles.diaHoy : ''}
                  ${seleccionado ? styles.diaSeleccionado : ''}
                  `}
                  style={{ background: bg || undefined, color: fg }}
                  onClick={() => seleccionarDia(dk)}
                  title={`${dia.getDate()} ${MESES[mes]} — ${getPorcentaje(dk)}%`}
                >
                  <span className={styles.diaNum} style={{ color: fg }}>{dia.getDate()}</span>
                  {tieneNota && <span className={styles.notaDot}>•</span>}
                  {getTareasDia(dk).length > 0 && (
                    <span className={styles.tareaDot}>•</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            {[
              { color: '#22c55e', label: '100%' },
              { color: '#86efac', label: '70–99%' },
              { color: '#fb923c', label: '1–69%' },
              { color: '#fee2e2', label: '0%' },
            ].map(item => (
              <div key={item.label} className={styles.leyendaItem}>
                <span className={styles.leyendaColor} style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
            <div className={styles.leyendaItem}>
              <span className={styles.notaDot}>•</span> Nota
            </div>
            <div className={styles.leyendaItem}>
              <span className={styles.tareaDot}>•</span> Tarea
            </div>
          </div>
        </div>

        {/* ── Panel lateral del día seleccionado ── */}
        {diaSeleccionado ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitulo}>
                {new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h3>
              <button className={styles.cerrarBtn} onClick={cerrarPanel}>✕</button>
            </div>

            {/* Progreso del día */}
            <div className={styles.panelProgreso}>
              <span className={styles.panelProgresoNum}>
                {getPorcentaje(diaSeleccionado)}%
              </span>
              <span className={styles.panelProgresoLabel}>completado</span>
            </div>

            {/* Hábitos del día */}
            <div className={styles.panelSeccion}>
              <p className={styles.panelSeccionLabel}>Hábitos</p>
              <ul className={styles.habitosList}>
                {getHabitosDelDia(diaSeleccionado).map(h => (
                  <li key={h.id} className={styles.habitoItem}>
                    <span className={`${styles.habitoDot} ${h.completado ? styles.habitoDotDone : ''}`}>
                      {h.completado ? '✓' : ''}
                    </span>
                    <span className={styles.habitoNombre}>
                      {h.emoji} {h.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Tareas del día */}
            {getTareasDia(diaSeleccionado).length > 0 && (
              <div className={styles.panelSeccion}>
                <p className={styles.panelSeccionLabel}>Tareas</p>
                <ul className={styles.habitosList}>
                  {getTareasDia(diaSeleccionado).map(t => (
                    <li key={t.id} className={styles.habitoItem}>
                      <span className={`${styles.habitoDot} ${t.completada ? styles.habitoDotDone : ''}`}>
                        {t.completada ? '✓' : ''}
                      </span>
                      <span className={styles.habitoNombre}>
                        {t.texto}
                        {t.horaTarea && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-hint)', marginLeft: 6 }}>
                            ⏰ {t.horaTarea}
                          </span>
                        )}
                      </span>
                      {!t.completada && (
                        <span className={`${styles.tareaBadge} ${styles[t.prioridad]}`}>
                          {t.prioridad}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nota del día */}
            <div className={styles.panelSeccion}>
              <p className={styles.panelSeccionLabel}>Nota del día</p>
              <textarea
                className={styles.notaInput}
                placeholder="Escribe una nota para este día..."
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                rows={4}
              />
              <button className={styles.guardarBtn} onClick={guardarNota}>
                Guardar nota
              </button>
            </div>
          </div>

        ) : (
          <div className={styles.panelVacio}>
            <span style={{ fontSize: 32 }}>📅</span>
            <p>Selecciona un día para ver sus detalles y agregar una nota</p>
          </div>
        )}

      </div>
    </div>
  )
}