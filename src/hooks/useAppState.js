import { useEffect } from "react";
import { useLocalStorage } from "./uselocalStorage";

/**
 * Hook que centraliza todo el estado global de la aplicación.
 * Maneja persistencia, modo oscuro y recordatorio de hábitos.
 */
export function useAppState() {
  const [habits, setHabits] = useLocalStorage("ht_habits", []);
  const [completions, setCompletions] = useLocalStorage("ht_completions", {});
  const [notas, setNotas] = useLocalStorage("ht_notas", {});
  const [tareas, setTareas] = useLocalStorage("tareas", []);
  const [darkMode, setDarkMode] = useLocalStorage("ht_dark", false);
  const [horaRecordatorioHabitos, setHoraRecordatorioHabitos] = useLocalStorage(
    "ht_hora_recordatorio",
    "",
  );

  // ── Modo oscuro ───────────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // ── Recordatorio diario de hábitos ────────────────────────
  useEffect(() => {
    if (!horaRecordatorioHabitos) return;

    function revisarHabitos() {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

      if (horaActual !== horaRecordatorioHabitos) return;

      const hoy = ahora.toISOString().slice(0, 10);
      const completadosHoy = habits.filter(
        (h) => completions[`${h.id}_${hoy}`],
      ).length;

      if (completadosHoy === habits.length && habits.length > 0) return;

      if (Notification.permission === "granted") {
        new Notification("💪 Recordatorio de hábitos", {
          body:
            completadosHoy === 0
              ? `¡No olvides tus hábitos de hoy! Tienes ${habits.length} pendientes.`
              : `Llevas ${completadosHoy} de ${habits.length} hábitos completados hoy. ¡Sigue así!`,
          icon: "/vite.svg",
        });
      }
    }

    revisarHabitos();
    const intervalo = setInterval(revisarHabitos, 60000);
    return () => clearInterval(intervalo);
  }, [horaRecordatorioHabitos, habits, completions]);

  return {
    // Estado
    habits,
    setHabits,
    completions,
    setCompletions,
    notas,
    setNotas,
    tareas,
    setTareas,
    darkMode,
    setDarkMode,
    horaRecordatorioHabitos,
    setHoraRecordatorioHabitos,
  };
}
