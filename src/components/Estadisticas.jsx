import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'
import { dateKey } from '../utils'
import styles from './Estadisticas.module.css'

export default function Estadisticas({ habits, completions }) {

    // ── Helpers ──────────────────────────────────────────────

    function getPorcentajeDia(dateStr) {
        if (!habits.length) return 0
        const completados = habits.filter(h => completions[`${h.id}_${dateStr}`]).length
        return Math.round((completados / habits.length) * 100)
    }

    function getCompletadosDia(dateStr) {
        return habits.filter(h => completions[`${h.id}_${dateStr}`]).length
    }

    // ── Datos: últimos N días ─────────────────────────────────

    function getUltimosDias(n) {
        return Array.from({ length: n }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (n - 1 - i))
            const dk = dateKey(d)
            return {
                fecha: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
                porcentaje: getPorcentajeDia(dk),
                completados: getCompletadosDia(dk),
                total: habits.length,
            }
        })
    }

    // ── Datos: por semana (últimas 8 semanas) ─────────────────

    function getPorSemana() {
        return Array.from({ length: 8 }, (_, i) => {
            const dias = Array.from({ length: 7 }, (_, j) => {
                const d = new Date()
                d.setDate(d.getDate() - (7 * (7 - i)) + j)
                return dateKey(d)
            })
            const avg = Math.round(
                dias.reduce((sum, dk) => sum + getPorcentajeDia(dk), 0) / 7
            )
            const semana = new Date()
            semana.setDate(semana.getDate() - (7 * (7 - i)))
            return {
                fecha: semana.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
                promedio: avg,
            }
        })
    }

    // ── Datos: por hábito (% de cumplimiento histórico) ───────

    function getPorHabito() {
        return habits.map(h => {
            const claves = Object.keys(completions).filter(k => k.startsWith(`${h.id}_`))
            const totalDias = claves.length
            const completados = claves.filter(k => completions[k]).length
            const pct = totalDias > 0 ? Math.round((completados / totalDias) * 100) : 0
            return {
                nombre: h.nombre || h.name,
                emoji: h.emoji,
                porcentaje: pct,
                dias: completados,
            }
        })
    }

    // ── Estadísticas generales ────────────────────────────────

    function getResumen() {
        const todasClaves = Object.keys(completions).filter(k => completions[k])
        const diasUnicos = [...new Set(todasClaves.map(k => k.split('_')[1]))]
        const diasPerfectos = diasUnicos.filter(dk => getPorcentajeDia(dk) === 100).length

        // Racha actual
        let rachaActual = 0
        const d = new Date()
        while (true) {
            const dk = dateKey(d)
            if (habits.length > 0 && habits.every(h => completions[`${h.id}_${dk}`])) {
                rachaActual++
                d.setDate(d.getDate() - 1)
            } else break
        }

        // Mejor racha
        let mejorRacha = 0
        let rachaTemp = 0
        const diasOrdenados = [...diasUnicos].sort()
        diasOrdenados.forEach(dk => {
            if (getPorcentajeDia(dk) === 100) {
                rachaTemp++
                if (rachaTemp > mejorRacha) mejorRacha = rachaTemp
            } else {
                rachaTemp = 0
            }
        })

        return { diasPerfectos, rachaActual, mejorRacha, totalDias: diasUnicos.length }
    }

    const resumen = getResumen()
    const datos30 = getUltimosDias(30)
    const datosSemanas = getPorSemana()
    const datosHabitos = getPorHabito()

    const colorBarra = '#3b4ef8'
    const colorLinea = '#22c55e'

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Estadísticas</h1>

            {habits.length === 0 ? (
                <div className={styles.empty}>
                    <p>Aún no tienes hábitos registrados.<br />¡Agrega uno para ver tus estadísticas!</p>
                </div>
            ) : (
                <>
                    {/* ── Tarjetas resumen ── */}
                    <div className={styles.resumenGrid}>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenIcon}>📅</span>
                            <span className={styles.resumenValor}>{resumen.totalDias}</span>
                            <span className={styles.resumenLabel}>Días registrados</span>
                        </div>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenIcon}>⭐</span>
                            <span className={styles.resumenValor}>{resumen.diasPerfectos}</span>
                            <span className={styles.resumenLabel}>Días perfectos</span>
                        </div>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenIcon}>🔥</span>
                            <span className={styles.resumenValor}>{resumen.rachaActual}</span>
                            <span className={styles.resumenLabel}>Racha actual</span>
                        </div>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenIcon}>🏆</span>
                            <span className={styles.resumenValor}>{resumen.mejorRacha}</span>
                            <span className={styles.resumenLabel}>Mejor racha</span>
                        </div>
                    </div>

                    {/* ── Gráfico de barras: últimos 30 días ── */}
                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Hábitos completados — últimos 30 días</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={datos30} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval={4} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, habits.length]} />
                                <Tooltip
                                    formatter={(val) => [`${val} hábitos`, 'Completados']}
                                    labelStyle={{ fontSize: 12 }}
                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                />
                                <Bar dataKey="completados" fill={colorBarra} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ── Gráfico de líneas: promedio semanal ── */}
                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Promedio semanal — últimas 8 semanas</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={datosSemanas} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                                <Tooltip
                                    formatter={(val) => [`${val}%`, 'Promedio']}
                                    labelStyle={{ fontSize: 12 }}
                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="promedio"
                                    stroke={colorLinea}
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: colorLinea }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ── Gráfico de barras: por hábito ── */}
                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Cumplimiento por hábito — histórico</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={datosHabitos} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="nombre"
                                    tick={{ fontSize: 12 }}
                                    width={90}
                                    tickFormatter={(val, i) => `${datosHabitos[i]?.emoji || ''} ${val}`}
                                />
                                <Tooltip
                                    formatter={(val) => [`${val}%`, 'Cumplimiento']}
                                    labelStyle={{ fontSize: 12 }}
                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                />
                                <Bar dataKey="porcentaje" fill="#7F77DD" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    )
}