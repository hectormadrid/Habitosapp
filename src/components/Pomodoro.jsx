import styles from './Pomodoro.module.css'
import { usePomodoro } from '../hooks/usePomodoro'

export default function Pomodoro() {
    const {
        formatTime,
        isRunning,
        isBreak,
        isLongBreak,
        progreso,
        pomodorosCompletados,
        start, pause, reset,
    } = usePomodoro()

    const estado = isLongBreak ? 'Descanso largo ☕' : isBreak ? 'Descanso corto 😌' : 'Concentración 🧠'
    const color = isLongBreak ? '#1D9E75' : isBreak ? '#7F77DD' : '#3b4ef8'

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h2 className={styles.titulo}>🍅 Pomodoro</h2>

                {/* Estado actual */}
                <p className={styles.estado} style={{ color }}>{estado}</p>

                {/* Contador de pomodoros */}
                <div className={styles.dots}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <span
                            key={i}
                            className={styles.dot}
                            style={{ background: i < (pomodorosCompletados % 4) ? color : 'var(--color-border-medium)' }}
                        />
                    ))}
                </div>
                <p className={styles.pomodoroCount}>
                    {pomodorosCompletados} pomodoro{pomodorosCompletados !== 1 ? 's' : ''} completados
                </p>

                {/* Barra de progreso */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progreso}%`, background: color }}
                    />
                </div>

                {/* Temporizador */}
                <div className={styles.timer} style={{ color }}>{formatTime()}</div>

                {/* Botones */}
                <div className={styles.buttons}>
                    {!isRunning ? (
                        <button className={styles.btnPrimary} style={{ background: color }} onClick={start}>
                            ▶ Iniciar
                        </button>
                    ) : (
                        <button className={styles.btnPrimary} style={{ background: color }} onClick={pause}>
                            ⏸ Pausar
                        </button>
                    )}
                    <button className={styles.btnSecondary} onClick={reset}>
                        ↺ Reiniciar
                    </button>
                </div>
            </div>
        </div>
    )
}