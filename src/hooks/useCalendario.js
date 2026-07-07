import { useState } from 'react'
import { useHabitos } from './useHabitos'
import { useLocalStorage } from './uselocalStorage'
import { useTareas } from './useTareas'
import { dateKey } from '../utils'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

/**
 * Hook que centraliza toda la lógica del calendario:
 * navegación, progreso por día, notas y tareas.
 */
export function useCalendario() {
  const { habits, completions } = useHabitos()
  const { tareas }              = useTareas()
  const [notas, setNotas]       = useLocalStorage('ht_notas', {})

  const hoy = new Date()
  const [mes, setMes]                       = useState(hoy.getMonth())
  const [año, setAño]                       = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [notaTexto, setNotaTexto]           = useState('')

  // ── Navegación ────────────────────────────────────────────

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAño(a => a - 1) }
    else setMes(m => m - 1)
  }

  function mesSiguiente() {
    if (mes === 11) { setMes(0); setAño(a => a + 1) }
    else setMes(m => m + 1)
  }

  // ── Datos del mes ─────────────────────────────────────────

  function getDiasDelMes() {
    const totalDias = new Date(año, mes + 1, 0).getDate()
    return Array.from({ length: totalDias }, (_, i) => new Date(año, mes, i + 1))
  }

  function getOffset() {
    const primerDia = new Date(año, mes, 1).getDay()
    return primerDia === 0 ? 6 : primerDia - 1
  }

  // ── Cálculos por día ──────────────────────────────────────

  function getPorcentaje(dk) {
    if (!habits.length) return 0
    const completados = habits.filter(h => completions[`${h.id}_${dk}`]).length
    return Math.round((completados / habits.length) * 100)
  }

  function getColorDia(dk, esFuturo) {
    if (esFuturo) return null
    const pct = getPorcentaje(dk)
    if (pct === 0)   return { bg: 'var(--color-pct-0)', fg: 'var(--color-pct-text-0)' }
    if (pct <= 40)   return { bg: 'var(--color-pct-1)', fg: 'var(--color-pct-text-1)' }
    if (pct <= 70)   return { bg: 'var(--color-pct-2)', fg: 'var(--color-pct-text-2)' }
    return { bg: 'var(--color-pct-3)', fg: 'var(--color-pct-text-3)' }
  }

  function getHabitosDelDia(dk) {
    return habits.map(h => ({
      ...h,
      completado: !!completions[`${h.id}_${dk}`],
    }))
  }

  function getTareasDia(dk) {
    return tareas.filter(t => t.fechaLimite && t.fechaLimite === dk)
  }

  // ── Notas ─────────────────────────────────────────────────

  function seleccionarDia(dk) {
    setDiaSeleccionado(dk)
    setNotaTexto(notas[dk] || '')
  }

  function guardarNota() {
    if (!diaSeleccionado) return
    setNotas(prev => ({ ...prev, [diaSeleccionado]: notaTexto }))
  }

  function cerrarPanel() {
    setDiaSeleccionado(null)
    setNotaTexto('')
  }

  return {
    // Navegación
    mes, año, MESES,
    mesAnterior, mesSiguiente,
    // Datos
    dias:    getDiasDelMes(),
    offset:  getOffset(),
    todayKey: dateKey(hoy),
    // Por día
    getPorcentaje,
    getColorDia,
    getHabitosDelDia,
    getTareasDia,
    // Panel
    diaSeleccionado,
    notaTexto, setNotaTexto,
    seleccionarDia,
    guardarNota,
    cerrarPanel,
    notas,
  }
}