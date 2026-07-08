import { useLocalStorage } from "./useLocalStorage";
import {
  todayStr,
  dateKey,
  getStreak,
  getBestStreak,
  dailyPercent,
  getWeekDates,
} from "../utils";

/**
 * Hook que centraliza toda la lógica de hábitos.
 * Expone el estado y las funciones que los componentes necesitan.
 */
export function useHabitos() {
  const [habits, setHabits] = useLocalStorage("ht_habits", []);
  const [completions, setCompletions] = useLocalStorage("ht_completions", {});
  const [sleep, setSleep] = useLocalStorage("ht_sleep", {});

  const today = todayStr();

  //  Completions
  function toggleCompletion(habitId, dateStr) {
    const key = `${habitId}_${dateStr}`;
    setCompletions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isDone(habitId, dateStr) {
    return !!completions[`${habitId}_${dateStr}`];
  }

  // Progreso

  function getDailyPercent(dateStr) {
    return dailyPercent(habits, completions, dateStr);
  }

  function getWeeklyProgress(weekOffset = 0) {
    if (!habits.length) return 0;
    const weekDates = getWeekDates(weekOffset);
    const passedDays = weekDates.filter((d) => dateKey(d) <= today);
    if (!passedDays.length) return 0;
    const total = passedDays.reduce(
      (sum, d) => sum + getDailyPercent(dateKey(d)),
      0,
    );
    return Math.round(total / passedDays.length);
  }

  function getTodayCompleted() {
    return habits.filter((h) => isDone(h.id, today)).length;
  }

  function getHabitStreak(habitId) {
    return getStreak(habitId, completions);
  }

  function getHabitBestStreak(habitId) {
    return getBestStreak(habitId, completions);
  }

  function getGlobalBestStreak() {
    if (!habits.length) return 0;
    return Math.max(...habits.map((h) => getHabitBestStreak(h.id)));
  }

  //  CRUD hábitos
  function addHabit(name, emoji) {
    setHabits((prev) => [...prev, { id: Date.now().toString(), name, emoji }]);
  }

  function updateHabit(id, name, emoji) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name, emoji } : h)),
    );
  }

  function deleteHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  // Sueño

  function setSleepDay(dateStr, hours) {
    setSleep((prev) => ({ ...prev, [dateStr]: hours }));
  }

  return {
    // Estado
    habits,
    completions,
    sleep,
    today,
    // Completions
    toggleCompletion,
    isDone,
    // Progreso
    getDailyPercent,
    getWeeklyProgress,
    getTodayCompleted,
    getHabitStreak,
    getHabitBestStreak,
    getGlobalBestStreak,
    // CRUD
    addHabit,
    updateHabit,
    deleteHabit,
    // Sueño
    setSleepDay,
  };
}
