import { useState, useEffect } from 'react'
import Tabs from './components/Tabs'
import HabitTab from './components/HabitTab'
import TaskList from './components/TaskList'

export default function App() {
  const [tabActiva, setTabActiva] = useState('habitos')

  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_habits') || '[]') } catch { return [] }
  })

  const [completions, setCompletions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_completions') || '{}') } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('ht_habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('ht_completions', JSON.stringify(completions))
  }, [completions])

  return (
    <div>
      <Tabs activa={tabActiva} onChange={setTabActiva} />

      {tabActiva === 'habitos' && (
        <HabitTab
          habits={habits}
          setHabits={setHabits}
          completions={completions}
          setCompletions={setCompletions}
        />
      )}
      {tabActiva === 'tareas' && <TaskList />}
    </div>
  )
}