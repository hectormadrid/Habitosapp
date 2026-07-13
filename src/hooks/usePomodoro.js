import { useEffect, useState } from "react";

export function usePomodoro() {
  const WORK_TIME       = 25 * 60
  const BREAK_SHORT     = 5  * 60
  const BREAK_LONG      = 15 * 60
  const POMODOROS_HASTA_LARGO = 4

  const [secondsLeft, setSecondsLeft]     = useState(WORK_TIME)
  const [isRunning, setIsRunning]         = useState(false)
  const [isBreak, setIsBreak]             = useState(false)
  const [isLongBreak, setIsLongBreak]     = useState(false)
  const [pomodorosCompletados, setPomodorosCompletados] = useState(0)

  const duracionTotal = isLongBreak ? BREAK_LONG : isBreak ? BREAK_SHORT : WORK_TIME
  const progreso = ((duracionTotal - secondsLeft) / duracionTotal) * 100

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1

        // Tiempo terminado
        const nuevosPomodoros = isBreak ? pomodorosCompletados : pomodorosCompletados + 1

        if (!isBreak) {
          // Terminó un pomodoro de trabajo
          setPomodorosCompletados(nuevosPomodoros)
          const esLargo = nuevosPomodoros % POMODOROS_HASTA_LARGO === 0
          setIsBreak(true)
          setIsLongBreak(esLargo)

          notify(
            '🍅 Pomodoro completado',
            esLargo
              ? `¡Excelente! Completaste ${nuevosPomodoros} pomodoros. Tómate 15 minutos.`
              : 'Tómate un descanso de 5 minutos.'
          )
          return esLargo ? BREAK_LONG : BREAK_SHORT
        } else {
          // Terminó el descanso
          setIsBreak(false)
          setIsLongBreak(false)
          notify('✅ Descanso terminado', 'Es hora de volver al trabajo.')
          return WORK_TIME
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isBreak, pomodorosCompletados, WORK_TIME, BREAK_SHORT, BREAK_LONG])

  function notify(titulo, cuerpo) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, { body: cuerpo, icon: '/vite.svg' })
    }
  }

  function start()  { setIsRunning(true) }
  function pause()  { setIsRunning(false) }

  function reset() {
    setIsRunning(false)
    setIsBreak(false)
    setIsLongBreak(false)
    setSecondsLeft(WORK_TIME)
    setPomodorosCompletados(0)
  }

  function formatTime() {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return {
    formatTime,
    isRunning,
    isBreak,
    isLongBreak,
    progreso,
    pomodorosCompletados,
    start, pause, reset,
  }
}