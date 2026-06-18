import { useState } from 'react'
import { DAYS_ES } from '../constants'
import { getWeekDates, dateKey, todayStr } from '../utils'
import HabitModal from './HabitModal'
import styles from './HabitTab.module.css'

const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10]

export default function HabitTab({ habits, setHabits, completions, setCompletions }) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [editHabit, setEditHabit] = useState(null)
    const [form, setForm] = useState({ name: '', emoji: '💪' })
    const [sleep, setSleep] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ht_sleep') || '{}') } catch { return {} }
    })

    const today = todayStr()
    const weekDates = getWeekDates(weekOffset)
    const weekLabel =
        weekOffset === 0 ? 'Esta semana' :
            weekOffset === -1 ? 'Semana pasada' :
                `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1}`

    function toggleCompletion(habitId, dateStr) {
        const key = `${habitId}_${dateStr}`
        setCompletions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    function isDone(habitId, dateStr) {
        return !!completions[`${habitId}_${dateStr}`]
    }

    function dailyCount(dateStr) {
        return habits.filter(h => isDone(h.id, dateStr)).length
    }

    function dailyPercent(dateStr) {
        if (!habits.length) return 0
        return Math.round((dailyCount(dateStr) / habits.length) * 100)
    }

    function weeklyProgress() {
        if (!habits.length) return 0
        const passedDays = weekDates.filter(d => dateKey(d) <= today)
        if (!passedDays.length) return 0
        const total = passedDays.reduce((sum, d) => sum + dailyPercent(dateKey(d)), 0)
        return Math.round(total / passedDays.length)
    }

    function progressColor(pct) {
        if (pct === 100) return '#22c55e'
        if (pct >= 70) return '#86efac'
        if (pct >= 40) return '#fb923c'
        return '#f87171'
    }

    function getStreak(habitId) {
        let streak = 0
        const d = new Date()
        while (completions[`${habitId}_${dateKey(d)}`]) {
            streak++
            d.setDate(d.getDate() - 1)
        }
        return streak
    }
    // Racha más larga histórica de un hábito
    function getBestStreak(habitId) {
        let best = 0
        let current = 0
        const d = new Date()
        d.setDate(d.getDate() - 365) // revisamos el último año

        for (let i = 0; i < 365; i++) {
            const key = `${habitId}_${dateKey(d)}`
            if (completions[key]) {
                current++
                if (current > best) best = current
            } else {
                current = 0
            }
            d.setDate(d.getDate() + 1)
        }
        return best
    }
    // Devuelve todos los días del mes actual
    function getDiasDelMes() {
        const hoy = new Date()
        const año = hoy.getFullYear()
        const mes = hoy.getMonth()
        const totalDias = new Date(año, mes + 1, 0).getDate()
        return Array.from({ length: totalDias }, (_, i) => {
            const d = new Date(año, mes, i + 1)
            return dateKey(d)
        })
    }

    // Color según el porcentaje del día
    function colorDia(dateStr) {
        const pct = dailyPercent(dateStr)
        const esFuturo = dateStr > today
        if (esFuturo) return '#f0f0ec'
        if (pct === 0) return '#fee2e2'
        if (pct <= 40) return '#fb923c'
        if (pct <= 70) return '#86efac'
        return '#22c55e'
    }

    // Cuántos hábitos completó hoy
    function todayCompleted() {
        return habits.filter(h => isDone(h.id, today)).length
    }

    function setSleepDay(dateStr, hours) {
        const updated = { ...sleep, [dateStr]: hours }
        setSleep(updated)
        localStorage.setItem('ht_sleep', JSON.stringify(updated))
    }

    function openAdd() {
        setEditHabit(null)
        setForm({ name: '', emoji: '💪', })
        setShowModal(true)
    }

    function openEdit(habit) {
        setEditHabit(habit)
        setForm({
            name: habit.name,
            emoji: habit.emoji,
        })
        setShowModal(true)
    }

    function saveHabit() {
        if (!form.name.trim()) return
        if (editHabit) {
            setHabits(prev =>
                prev.map(h =>
                    h.id === editHabit.id
                        ? { ...h, name: form.name, emoji: form.emoji }
                        : h
                )
            )
        } else {
            setHabits(prev => [
                ...prev,
                { id: Date.now().toString(), name: form.name, emoji: form.emoji },
            ])
        }
        setShowModal(false)
    }

    function deleteHabit() {
        setHabits(prev => prev.filter(h => h.id !== editHabit.id))
        setShowModal(false)
    }

    const pct = weeklyProgress()
    const radius = 70
    const stroke = 10
    const normalizedRadius = radius - stroke / 2
    const circumference = 2 * Math.PI * normalizedRadius
    const dashOffset = circumference - (pct / 100) * circumference

    return (
        <div>
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
            {habits.length > 0 && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>✅</span>
                        <span className={styles.statValue}>{todayCompleted()}/{habits.length}</span>
                        <span className={styles.statLabel}>Hoy</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>⭐</span>
                        <span className={styles.statValue}>
                            {habits.length > 0 ? Math.max(...habits.map(h => getBestStreak(h.id))) : 0}
                        </span>
                        <span className={styles.statLabel}>Mejor racha</span>
                    </div>
                </div>
            )}

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

            <div className={styles.weekNav}>
                <button className={styles.btn} onClick={() => setWeekOffset(o => o - 1)}>
                    <i className="ti ti-arrow-left" aria-hidden="true" />
                </button>
                <span className={styles.weekLabel}>{weekLabel}</span>
                <button className={styles.btn} onClick={() => setWeekOffset(o => o + 1)} disabled={weekOffset >= 0} style={{ opacity: weekOffset >= 0 ? 0.4 : 1 }}>
                    <i className="ti ti-arrow-right" aria-hidden="true" />
                </button>
            </div>

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
                                const streak = getStreak(habit.id)
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
                                            const dk = dateKey(date)
                                            const done = isDone(habit.id, dk)
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
                                    <td key={i} className={styles.tdFooterCount}>{dailyCount(dateKey(date))}</td>
                                ))}
                            </tr>
                            <tr className={styles.footerRow}>
                                <td className={styles.tdFooterLabel}>Progreso diario</td>
                                {weekDates.map((date, i) => {
                                    const dk = dateKey(date)
                                    const p = dailyPercent(dk)
                                    const future = date > new Date() && dk !== today
                                    return (
                                        <td key={i} className={styles.tdFooterPct}
                                            style={{ background: future ? 'transparent' : progressColor(p) }}>
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
                                            <select className={styles.sleepSelect} value={sleep[dk] ?? 7} onChange={e => setSleepDay(dk, Number(e.target.value))}>
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
                {habits.length > 0 && (
                <div className={styles.mesSection}>
                    <h3 className={styles.mesTitulo}>
                        Rachas del mes — {new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className={styles.mesGrid}>
                        {getDiasDelMes().map(dk => {
                            const dia = new Date(dk + 'T12:00:00')
                            const esFuturo = dk > today
                            return (
                                <div
                                    key={dk}
                                    className={styles.mesDia}
                                    style={{ background: colorDia(dk) }}
                                    title={esFuturo ? '' : `${dia.getDate()} — ${dailyPercent(dk)}%`}
                                >
                                    <span className={styles.mesDiaNum}>{dia.getDate()}</span>
                                    {!esFuturo && dailyPercent(dk) === 100 && (
                                        <span className={styles.mesDiaCheck}>🔥</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Leyenda */}
                    <div className={styles.mesLeyenda}>
                        <div className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: '#22c55e' }} />
                            100%
                        </div>
                        <div className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: '#86efac' }} />
                            70–99%
                        </div>
                        <div className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: '#fb923c' }} />
                            1–69%
                        </div>
                        <div className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: '#fee2e2' }} />
                            0%
                        </div>
                        <div className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: '#f0f0ec' }} />
                            Futuro
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <HabitModal form={form} setForm={setForm} onSave={saveHabit} onDelete={deleteHabit} onClose={() => setShowModal(false)} isEditing={!!editHabit} />
            )}

        </div>
    )
}
