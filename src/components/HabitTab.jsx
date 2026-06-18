import { useState } from 'react'
import {  DAYS_ES } from '../constants'
import { getWeekDates, dateKey, todayStr } from '../utils'
import HabitModal from './HabitModal'
import styles from './HabitTab.module.css'

const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10]

export default function HabitTab({ habits, setHabits, completions, setCompletions }) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [editHabit, setEditHabit] = useState(null)
    const [form, setForm] = useState({ name: '', emoji: '💪'})
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

    function setSleepDay(dateStr, hours) {
        const updated = { ...sleep, [dateStr]: hours }
        setSleep(updated)
        localStorage.setItem('ht_sleep', JSON.stringify(updated))
    }

    function openAdd() {
        setEditHabit(null)
        setForm({ name: '', emoji: '💪',   })
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
                        ? { ...h, name: form.name, emoji: form.emoji}
                        : h
                )
            )
        } else {
            setHabits(prev => [
                ...prev,
                { id: Date.now().toString(), name: form.name, emoji: form.emoji},
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

            {showModal && (
                <HabitModal form={form} setForm={setForm} onSave={saveHabit} onDelete={deleteHabit} onClose={() => setShowModal(false)} isEditing={!!editHabit} />
            )}

        </div>
    )
}
