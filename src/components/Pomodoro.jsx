import styles from "./Pomodoro.module.css";
import { usePomodoro } from "../hooks/usePomodoro";

export default function Pomodoro() {

    const {
        formatTime,
        isRunning,
        isBreak,
        start,
        pause,
        reset
    } = usePomodoro();

    return (

        <div className={styles.card}>

            <h2>🍅 Pomodoro</h2>

            <p className={styles.estado}>
                {isBreak ? "Descanso" : "Concentración"}
            </p>

            <div className={styles.timer}>
                {formatTime()}
            </div>

            <div className={styles.buttons}>

                {!isRunning ? (
                    <button onClick={start}>
                        ▶ Iniciar
                    </button>
                ) : (
                    <button onClick={pause}>
                        ⏸ Pausar
                    </button>
                )}

                <button onClick={reset}>
                    ↺ Reiniciar
                </button>

            </div>

        </div>

    );

}