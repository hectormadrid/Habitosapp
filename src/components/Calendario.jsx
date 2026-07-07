import { useCalendario } from '../hooks/useCalendario'
import styles from './Calendario.module.css'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Calendario() {
  const {
    mes, año, MESES,
    mesAnterior, mesSiguiente,
    dias, offset, todayKey,
    getPorcentaje, getColorDia,
    getHabitosDelDia, getTareasDia,
    diaSeleccionado, notaTexto, setNotaTexto,
    seleccionarDia, guardarNota, cerrarPanel,
    notas,
  } = useCalendario()

  return (
    <div className={styles.container}>
      <div className={styles.layout}>

        {/* ── Calendario ── */}
        <div className={styles.calendarSection}>
          <div className={styles.nav}>
            <button className={styles.navBtn} onClick={mesAnterior}>←</button>
            <h2 className={styles.mesLabel}>{MESES[mes]} {año}</h2>
            <button className={styles.navBtn} onClick={mesSiguiente}>→</button>
          </div>

          <div className={styles.grid}>
            {DIAS_SEMANA.map(d => (
              <div key={d} className={styles.dayName}>{d}</div>
            ))}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {dias.map(dia => {
              const dk         = dia.toISOString().slice(0, 10)
              const esHoy      = dk === todayKey
              const esFuturo   = dia > new Date() && dk !== todayKey
              const colors     = getColorDia(dk, esFuturo)
              const bg         = colors?.bg
              const fg         = colors?.fg || 'var(--color-text)'
              const tieneNota  = !!notas[dk]
              const seleccionado = diaSeleccionado === dk

              return (
                <div
                  key={dk}
                  className={`${styles.dia} ${esHoy ? styles.diaHoy : ''} ${seleccionado ? styles.diaSeleccionado : ''}`}
                  style={{ background: bg, color: fg }}
                  onClick={() => seleccionarDia(dk)}
                  title={`${dia.getDate()} ${MESES[mes]} — ${getPorcentaje(dk)}%`}
                >
                  <span className={styles.diaNum} style={{ color: fg }}>{dia.getDate()}</span>
                  {tieneNota && <span className={styles.notaDot}>•</span>}
                  {getTareasDia(dk).length > 0 && <span className={styles.tareaDot}>•</span>}
                </div>
              )
            })}
          </div>

          <div className={styles.leyenda}>
            {[
              { color: '#22c55e', label: '100%' },
              { color: '#86efac', label: '70–99%' },
              { color: '#fb923c', label: '1–69%' },
              { color: '#fee2e2', label: '0%' },
            ].map(({ color, label }) => (
              <div key={label} className={styles.leyendaItem}>
                <span className={styles.leyendaColor} style={{ background: color }} />
                {label}
              </div>
            ))}
            <div className={styles.leyendaItem}><span className={styles.notaDot}>•</span> Nota</div>
            <div className={styles.leyendaItem}><span className={styles.tareaDot}>•</span> Tarea</div>
          </div>
        </div>

        {/* ── Panel lateral ── */}
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

            <div className={styles.panelProgreso}>
              <span className={styles.panelProgresoNum}>{getPorcentaje(diaSeleccionado)}%</span>
              <span className={styles.panelProgresoLabel}>completado</span>
            </div>

            <div className={styles.panelSeccion}>
              <p className={styles.panelSeccionLabel}>Hábitos</p>
              <ul className={styles.habitosList}>
                {getHabitosDelDia(diaSeleccionado).map(h => (
                  <li key={h.id} className={styles.habitoItem}>
                    <span className={`${styles.habitoDot} ${h.completado ? styles.habitoDotDone : ''}`}>
                      {h.completado ? '✓' : ''}
                    </span>
                    <span className={styles.habitoNombre}>{h.emoji} {h.name}</span>
                  </li>
                ))}
              </ul>
            </div>

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