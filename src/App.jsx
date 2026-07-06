import { useAppState } from './hooks/useAppState'
import Tabs from './components/Tabs'
import HabitTab from './components/HabitTab'
import TaskList from './components/TaskList'
import Estadisticas from './components/Estadisticas'
import Calendario from './components/Calendario'
import { useState } from 'react'

export default function App() {
  const [tabActiva, setTabActiva] = useState('habitos')

  const {
    habits,        setHabits,
    completions,   setCompletions,
    notas,         setNotas,
    tareas,        setTareas,
    darkMode,      setDarkMode,
    horaRecordatorioHabitos, setHoraRecordatorioHabitos,
  } = useAppState()

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