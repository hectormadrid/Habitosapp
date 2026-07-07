import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'
import { useEstadisticas } from '../hooks/useEstadisticas'
import styles from './Estadisticas.module.css'

const COLOR_BARRA = '#3b4ef8'
const COLOR_LINEA = '#22c55e'

export default function Estadisticas() {
    const { habits, resumen, datos30, datosSemanas, datosHabitos } = useEstadisticas()

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Estadísticas</h1>

            {habits.length === 0 ? (
                <div className={styles.empty}>
                    <p>Aún no tienes hábitos registrados.<br />¡Agrega uno para ver tus estadísticas!</p>
                </div>
            ) : (
                <>
                    <div className={styles.resumenGrid}>
                        {[
                            { icono: '📅', valor: resumen.totalDias, label: 'Días registrados' },
                            { icono: '⭐', valor: resumen.diasPerfectos, label: 'Días perfectos' },
                            { icono: '🔥', valor: resumen.rachaActual, label: 'Racha actual' },
                            { icono: '🏆', valor: resumen.mejorRacha, label: 'Mejor racha' },
                        ].map(({ icono, valor, label }) => (
                            <div key={label} className={styles.resumenCard}>
                                <span className={styles.resumenIcon}>{icono}</span>
                                <span className={styles.resumenValor}>{valor}</span>
                                <span className={styles.resumenLabel}>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Hábitos completados — últimos 30 días</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={datos30} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval={4} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, habits.length]} />
                                <Tooltip formatter={val => [`${val} hábitos`, 'Completados']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                <Bar dataKey="completados" fill={COLOR_BARRA} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Promedio semanal — últimas 8 semanas</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={datosSemanas} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                                <Tooltip formatter={val => [`${val}%`, 'Promedio']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                <Line type="monotone" dataKey="promedio" stroke={COLOR_LINEA} strokeWidth={2.5} dot={{ r: 4, fill: COLOR_LINEA }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.graficoCard}>
                        <h2 className={styles.graficoTitulo}>Cumplimiento por hábito — histórico</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={datosHabitos} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90}
                                    tickFormatter={(val, i) => `${datosHabitos[i]?.emoji || ''} ${val}`} />
                                <Tooltip formatter={val => [`${val}%`, 'Cumplimiento']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                <Bar dataKey="porcentaje" fill="#7F77DD" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    )
}