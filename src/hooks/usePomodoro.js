import { useEffect, useState } from "react";

export function usePomodoro() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(
              isBreak ? "✅ Descanso terminado" : "🍅 Pomodoro completado",
              {
                body: isBreak
                  ? "Es hora de volver al trabajo."
                  : "Tómate un descanso de 5 minutos.",
              },
            );
          }

          if (isBreak) {
            setIsBreak(false);
            return WORK_TIME;
          }

          setIsBreak(true);
          return BREAK_TIME;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak, WORK_TIME, BREAK_TIME]);

  function start() {
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(WORK_TIME);
  }

  function formatTime() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return {
    secondsLeft,
    isRunning,
    isBreak,
    start,
    pause,
    reset,
    formatTime,
  };
}
