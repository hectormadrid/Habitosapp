import { useState, useEffect } from 'react'
import Tabs from './components/Tabs'
import HabitTab from './components/HabitTab'
import TaskList from './components/TaskList'
import Estadisticas from './components/Estadisticas'
import Calendario from './components/Calendario'

export default function App() {
  const [tabActiva, setTabActiva] = useState('habitos')

  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_habits') || '[]') } catch { return [] }
  })

  const [completions, setCompletions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_completions') || '{}') } catch { return {} }
  })

  const [notas, setNotas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_notas') || '{}') } catch { return {} }
  })


  const [tareas, setTareas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tareas') || '[]') } catch { return [] }
  })

  const [horaRecordatorioHabitos, setHoraRecordatorioHabitos] = useState(() => {
    return localStorage.getItem('ht_hora_recordatorio') || ''
  })

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ht_dark') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('ht_habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('ht_completions', JSON.stringify(completions))
  }, [completions])

  useEffect(() => {
    localStorage.setItem('ht_notas', JSON.stringify(notas))
  }, [notas])

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  useEffect(() => {
    localStorage.setItem('ht_hora_recordatorio', horaRecordatorioHabitos)
  }, [horaRecordatorioHabitos])

  useEffect(() => {
    if (!horaRecordatorioHabitos) return

    function revisarHabitos() {
      const ahora = new Date()
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`

      if (horaActual !== horaRecordatorioHabitos) return

      const hoy = ahora.toISOString().slice(0, 10)
      const completadosHoy = habits.filter(h =>
        completions[`${h.id}_${hoy}`]
      ).length

      if (completadosHoy === habits.length && habits.length > 0) return

      if (Notification.permission === 'granted') {
        new Notification('💪 Recordatorio de hábitos', {
          body: completadosHoy === 0
            ? `¡No olvides tus hábitos de hoy! Tienes ${habits.length} pendientes.`
            : `Llevas ${completadosHoy} de ${habits.length} hábitos completados hoy. ¡Sigue así!`,
          icon: '/vite.svg',
        })
      }
    }

    revisarHabitos()
    const intervalo = setInterval(revisarHabitos, 60000)
    return () => clearInterval(intervalo)
  }, [horaRecordatorioHabitos, habits, completions])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('ht_dark', darkMode)
  }, [darkMode])

  return (
    <div>
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: darkMode ? '#e5e5e5' : '#1a1a1a',
          color: darkMode ? '#1a1a1a' : '#e5e5e5',
          border: 'none',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 999,
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        aria-label="Cambiar modo"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <Tabs activa={tabActiva} onChange={setTabActiva} />

      {tabActiva === 'habitos' && (
        <HabitTab
          habits={habits}
          setHabits={setHabits}
          completions={completions}
          setCompletions={setCompletions}
          horaRecordatorio={horaRecordatorioHabitos}
          setHoraRecordatorio={setHoraRecordatorioHabitos}
        />
      )}
      {tabActiva === 'tareas' && (
        <TaskList
          tareas={tareas}
          setTareas={setTareas}
        />
      )}
      {tabActiva === 'estadisticas' && (
        <Estadisticas habits={habits} completions={completions} />
      )}
      {tabActiva === 'calendario' && (
        <Calendario
          habits={habits}
          completions={completions}
          notas={notas}
          setNotas={setNotas}
          tareas={tareas}
        />
      )}
    </div>
  )
}