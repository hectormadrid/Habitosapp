import { useHabitos } from './useHabitos'
import { dateKey } from '../utils'

/**
 * Hook que centraliza toda la lógica de cálculo
 * para la sección de estadísticas.
 */
export function useEstadisticas() {
  const { habits, completions } = useHabitos()

  // ── Helpers ──────────────────────────────────────────────

  function getPorcentajeDia(dk) {
    if (!habits.length) return 0
    const completados = habits.filter(h => completions[`${h.id}_${dk}`]).length
    return Math.round((completados / habits.length) * 100)
  }

  function getCompletadosDia(dk) {
    return habits.filter(h => completions[`${h.id}_${dk}`]).length
  }

  // ── Datos para gráficos ───────────────────────────────────

  function getUltimosDias(n) {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (n - 1 - i))
      const dk = dateKey(d)
      return {
        fecha:      d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        porcentaje: getPorcentajeDia(dk),
        completados: getCompletadosDia(dk),
        total:      habits.length,
      }
    })
  }

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
        fecha:    semana.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        promedio: avg,
      }
    })
  }

  function getPorHabito() {
    return habits.map(h => {
      const claves     = Object.keys(completions).filter(k => k.startsWith(`${h.id}_`))
      const totalDias  = claves.length
      const completados = claves.filter(k => completions[k]).length
      const pct        = totalDias > 0 ? Math.round((completados / totalDias) * 100) : 0
      return { name: h.name, emoji: h.emoji, porcentaje: pct, dias: completados }
    })
  }

  function getResumen() {
    const todasClaves  = Object.keys(completions).filter(k => completions[k])
    const diasUnicos   = [...new Set(todasClaves.map(k => k.split('_')[1]))]
    const diasPerfectos = diasUnicos.filter(dk => getPorcentajeDia(dk) === 100).length

    let rachaActual = 0
    const d = new Date()
    while (habits.length > 0 && habits.every(h => completions[`${h.id}_${dateKey(d)}`])) {
      rachaActual++
      d.setDate(d.getDate() - 1)
    }

    let mejorRacha = 0
    let rachaTemp  = 0
    ;[...diasUnicos].sort().forEach(dk => {
      if (getPorcentajeDia(dk) === 100) {
        rachaTemp++
        if (rachaTemp > mejorRacha) mejorRacha = rachaTemp
      } else {
        rachaTemp = 0
      }
    })

    return {
      totalDias: diasUnicos.length,
      diasPerfectos,
      rachaActual,
      mejorRacha,
    }
  }

  return {
    habits,
    resumen:       getResumen(),
    datos30:       getUltimosDias(30),
    datosSemanas:  getPorSemana(),
    datosHabitos:  getPorHabito(),
  }
}