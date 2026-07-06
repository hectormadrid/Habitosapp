import { useState } from 'react'
import { DAYS_ES } from '../constants'
import { getWeekDates, dateKey, getDiasDelMes, colorPorcentaje } from '../utils'
import { useHabitos } from '../hooks/useHabitos'
import HabitModal from './HabitModal'
import styles from './HabitTab.module.css'

const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10]

export default function HabitTab({ horaRecordatorio, setHoraRecordatorio }) {
  // ── Hook centralizado ─────────────────────────────────────
  const {
    habits,
    sleep,
    today,
    toggleCompletion,
    isDone,
    getDailyPercent,
    getWeeklyProgress,
    getTodayCompleted,
    getHabitStreak,
    getGlobalBestStreak,
    addHabit,
    updateHabit,
    deleteHabit,
    setSleepDay,
  } = useHabitos()

  // ── Estado local de UI ────────────────────────────────────
  const [weekOffset, setWeekOffset] = useState(0)
  const [showModal, setShowModal]   = useState(false)
  const [editHabit, setEditHabit]   = useState(null)
  const [form, setForm]             = useState({ name: '', emoji: '💪' })

  const weekDates = getWeekDates(weekOffset)
  const weekLabel =
    weekOffset === 0  ? 'Esta semana' :
    weekOffset === -1 ? 'Semana pasada' :
    `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1}`

  // ── Modal handlers ────────────────────────────────────────
  function openAdd() {
    setEditHabit(null)
    setForm({ name: '', emoji: '💪' })
    setShowModal(true)
  }

  function openEdit(habit) {
    setEditHabit(habit)
    setForm({ name: habit.name, emoji: habit.emoji })
    setShowModal(true)
  }

  function saveHabit() {
    if (!form.name.trim()) return
    if (editHabit) {
      updateHabit(editHabit.id, form.name, form.emoji)
    } else {
      addHabit(form.name, form.emoji)
    }
    setShowModal(false)
  }

 function handleDelete() {
  if (!editHabit) return
  deleteHabit(editHabit.id)
  setShowModal(false)
}

  // ── Cálculos del SVG ──────────────────────────────────────
  const pct              = getWeeklyProgress(weekOffset)
  const radius           = 70
  const stroke           = 10
  const normalizedRadius = radius - stroke / 2
  const circumference    = 2 * Math.PI * normalizedRadius
  const dashOffset       = circumference - (pct / 100) * circumference

  return (
    <div>
      {/* ── Encabezado ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis hábitos</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openAdd}>
          <i className="ti ti-plus" aria-hidden="true" />Nuevo
        </button>
      </div>

      {/* ── Recordatorio diario ── */}
      <div className={styles.recordatorioRow}>
        <span className={styles.recordatorioLabel}>🔔 Recordatorio diario</span>
        <input
          type="time"
          className={styles.recordatorioInput}
          value={horaRecordatorio}
          onChange={e => setHoraRecordatorio(e.target.value)}
          title="Hora del recordatorio diario de hábitos"
        />
        {horaRecordatorio && (
          <button
            className={styles.recordatorioClear}
            onClick={() => setHoraRecordatorio('')}
            title="Quitar recordatorio"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Tarjetas de estadísticas ── */}
      {habits.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statValue}>{getTodayCompleted()}/{habits.length}</span>
            <span className={styles.statLabel}>Hoy</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⭐</span>
            <span className={styles.statValue}>{getGlobalBestStreak()}</span>
            <span className={styles.statLabel}>Mejor racha</span>
          </div>
        </div>
      )}

      {/* ── Círculo de progreso semanal ── */}
      <div className={styles.progressSection}>
        <p className={styles.progressTitle}>PROGRESO SEMANAL</p>
        <svg width={radius * 2} height={radius * 2}>
          <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none" stroke="#3b4ef8" strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius} ${radius})`}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x={radius} y={radius} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="600" fill="currentColor">
            {pct}%
          </text>
        </svg>
      </div>

      {/* ── Navegación semanal ── */}
      <div className={styles.weekNav}>
        <button className={styles.btn} onClick={() => setWeekOffset(o => o - 1)}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
        </button>
        <span className={styles.weekLabel}>{weekLabel}</span>
        <button
          className={styles.btn}
          onClick={() => setWeekOffset(o => o + 1)}
          disabled={weekOffset >= 0}
          style={{ opacity: weekOffset >= 0 ? 0.4 : 1 }}
        >
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </button>
      </div>

      {/* ── Tabla de hábitos ── */}
      {habits.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="ti ti-clipboard-list" style={{ fontSize: 40 }} aria-hidden="true" />
          <p>Aún no tienes hábitos.<br />¡Agrega uno para empezar!</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thHabit}>Hábitos</th>
                {weekDates.map((date, i) => (
                  <th key={i} className={styles.thDay}>{DAYS_ES[date.getDay()]}</th>
                ))}
              </tr>
              <tr>
                <th className={styles.thEmpty} />
                {weekDates.map((date, i) => (
                  <th key={i} className={`${styles.thDayNum} ${dateKey(date) === today ? styles.thToday : ''}`}>
                    {date.getDate()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {habits.map(habit => {
                const streak = getHabitStreak(habit.id)
                return (
                  <tr key={habit.id} className={styles.habitRow}>
                    <td className={styles.tdHabit}>
                      <span className={styles.habitEmoji}>{habit.emoji}</span>
                      <span className={styles.habitName}>{habit.name}</span>
                      {streak > 0 && <span className={styles.streak}>🔥{streak}</span>}
                      <button className={styles.editBtn} onClick={() => openEdit(habit)} aria-label="Editar">
                        <i className="ti ti-pencil" aria-hidden="true" />
                      </button>
                    </td>
                    {weekDates.map((date, i) => {
                      const dk     = dateKey(date)
                      const done   = isDone(habit.id, dk)
                      const future = date > new Date() && dk !== today
                      return (
                        <td key={i} className={styles.tdCheck}>
                          <button
                            className={`${styles.checkbox} ${done ? styles.checkboxDone : ''}`}
                            onClick={() => !future && toggleCompletion(habit.id, dk)}
                            style={{ opacity: future ? 0.3 : 1, cursor: future ? 'default' : 'pointer' }}
                            aria-label={`${habit.name} ${dk}`}
                          >
                            {done && <i className="ti ti-check" aria-hidden="true" />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>

            <tfoot>
              <tr className={styles.footerRow}>
                <td className={styles.tdFooterLabel}>Recuento de hábitos</td>
                {weekDates.map((date, i) => (
                  <td key={i} className={styles.tdFooterCount}>
                    {habits.filter(h => isDone(h.id, dateKey(date))).length}
                  </td>
                ))}
              </tr>
              <tr className={styles.footerRow}>
                <td className={styles.tdFooterLabel}>Progreso diario</td>
                {weekDates.map((date, i) => {
                  const dk     = dateKey(date)
                  const p      = getDailyPercent(dk)
                  const future = date > new Date() && dk !== today
                  return (
                    <td key={i} className={styles.tdFooterPct}
                      style={{ background: future ? 'transparent' : colorPorcentaje(p, false).bg }}>
                      {future ? '—' : `${p}%`}
                    </td>
                  )
                })}
              </tr>
              <tr className={styles.footerRow}>
                <td className={styles.tdFooterLabel}>Horas de sueño</td>
                {weekDates.map((date, i) => {
                  const dk = dateKey(date)
                  return (
                    <td key={i} className={styles.tdSleep}>
                      <select
                        className={styles.sleepSelect}
                        value={sleep[dk] ?? 7}
                        onChange={e => setSleepDay(dk, Number(e.target.value))}
                      >
                        {SLEEP_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Rachas del mes ── */}
      {habits.length > 0 && (
        <div className={styles.mesSection}>
          <h3 className={styles.mesTitulo}>
            Rachas del mes — {new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}
          </h3>
          <div className={styles.mesGrid}>
            {getDiasDelMes().map(dk => {
              const dia      = new Date(dk + 'T12:00:00')
              const esFuturo = dk > today
              const { bg, fg } = colorPorcentaje(getDailyPercent(dk), esFuturo)
              return (
                <div
                  key={dk}
                  className={styles.mesDia}
                  style={{ background: bg, color: fg }}
                  title={esFuturo ? '' : `${dia.getDate()} — ${getDailyPercent(dk)}%`}
                >
                  <span className={styles.mesDiaNum} style={{ color: fg }}>{dia.getDate()}</span>
                  {!esFuturo && getDailyPercent(dk) === 100 && (
                    <span className={styles.mesDiaCheck}>🔥</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className={styles.mesLeyenda}>
            {[
              { color: '#22c55e', label: '100%' },
              { color: '#86efac', label: '70–99%' },
              { color: '#fb923c', label: '1–69%' },
              { color: '#fee2e2', label: '0%' },
              { color: '#f0f0ec', label: 'Futuro' },
            ].map(({ color, label }) => (
              <div key={label} className={styles.leyendaItem}>
                <span className={styles.leyendaColor} style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <HabitModal
          form={form}
          setForm={setForm}
          onSave={saveHabit}
          onDelete={handleDelete}
          onClose={() => setShowModal(false)}
          isEditing={!!editHabit}
        />
      )}
    </div>
  )
}
