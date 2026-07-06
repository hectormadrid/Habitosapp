// Fechas 

/**
 * Convierte una fecha a string 'YYYY-MM-DD'
 */
export function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

/**
 * Devuelve el string 'YYYY-MM-DD' de hoy
 */
export function todayStr() {
  return dateKey(new Date())
}

/**
 * Devuelve un array con las 7 fechas de la semana según el offset.
 * offset=0 → semana actual, offset=-1 → semana pasada, etc.
 */
export function getWeekDates(offset = 0) {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow + (dow === 0 ? -6 : 1) + offset * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/**
 * Devuelve todos los días del mes y año indicados como strings 'YYYY-MM-DD'.
 * Si no se pasan argumentos usa el mes actual.
 */
export function getDiasDelMes(mes, año) {
  const hoy = new Date()
  const m = mes ?? hoy.getMonth()
  const a = año ?? hoy.getFullYear()
  const totalDias = new Date(a, m + 1, 0).getDate()
  return Array.from({ length: totalDias }, (_, i) => {
    return dateKey(new Date(a, m, i + 1))
  })
}

/**
 * Devuelve cuántos espacios vacíos van antes del primer día del mes
 * para que el calendario empiece en lunes.
 */
export function getOffsetMes(mes, año) {
  const primerDia = new Date(año, mes, 1).getDay()
  return primerDia === 0 ? 6 : primerDia - 1
}

/**
 * Formatea minutos de anticipación en texto legible.
 * Ej: 5 → "5m antes", 60 → "1h antes", 1440 → "1 día antes"
 */
export function formatAnticipacion(minutos) {
  if (minutos === 1440) return '1 día antes'
  if (minutos >= 60)   return `${minutos / 60}h antes`
  return `${minutos}m antes`
}

// localStorage 

/**
 * Lee un valor de localStorage parseando JSON.
 * Devuelve defaultValue si la clave no existe o hay un error.
 */
export function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Guarda un valor en localStorage como JSON.
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error(`Error guardando ${key} en localStorage`)
  }
}

//  Progreso de hábitos 

/**
 * Calcula el porcentaje de hábitos completados en un día.
 */
export function dailyPercent(habits, completions, dateStr) {
  if (!habits.length) return 0
  const completados = habits.filter(h => !!completions[`${h.id}_${dateStr}`]).length
  return Math.round((completados / habits.length) * 100)
}

/**
 * Calcula la racha actual de un hábito (días consecutivos hasta hoy).
 */
export function getStreak(habitId, completions) {
  let streak = 0
  const d = new Date()
  while (completions[`${habitId}_${dateKey(d)}`]) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/**
 * Calcula la mejor racha histórica de un hábito en el último año.
 */
export function getBestStreak(habitId, completions) {
  let best = 0
  let current = 0
  const d = new Date()
  d.setDate(d.getDate() - 365)

  for (let i = 0; i < 365; i++) {
    if (completions[`${habitId}_${dateKey(d)}`]) {
      current++
      if (current > best) best = current
    } else {
      current = 0
    }
    d.setDate(d.getDate() + 1)
  }
  return best
}

/**
 * Devuelve el color de fondo y texto según el porcentaje del día.
 */
export function colorPorcentaje(pct, esFuturo) {
  if (esFuturo) return { bg: 'var(--color-empty-future)', fg: 'var(--color-text-hint)' }
  if (pct === 0)   return { bg: 'var(--color-pct-0)', fg: 'var(--color-pct-text-0)' }
  if (pct <= 40)   return { bg: 'var(--color-pct-1)', fg: 'var(--color-pct-text-1)' }
  if (pct <= 70)   return { bg: 'var(--color-pct-2)', fg: 'var(--color-pct-text-2)' }
  return { bg: 'var(--color-pct-3)', fg: 'var(--color-pct-text-3)' }
}