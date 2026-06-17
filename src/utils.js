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

/** Convierte una fecha a string 'YYYY-MM-DD' */
export function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

/** Devuelve el string 'YYYY-MM-DD' de hoy */
export function todayStr() {
  return dateKey(new Date())
}

/** Lee un valor de localStorage parseando JSON; devuelve `defaultValue` si falla */
export function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}
