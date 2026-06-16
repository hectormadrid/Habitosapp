import { useState } from 'react'
import Header from './components/Header'
import Tabs from './components/Tabs'
import HabitList from './components/HabitList'

export default function App() {
  const [tabActiva, setTabsActiva] = useState('habitos')
  return (
    <div>
      <Header 
      titulo="Mis Habitos"
      subtitulo="Agrega tus habitos diarios"
      fecha={new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
      />
      <Tabs activa={tabActiva} onChange={setTabsActiva} />
      
    {tabActiva === 'habitos' && <HabitList />} 
    {tabActiva === 'tareas' && <p style={{ textAlign: 'center', color: '#888' }}>Próximamente...</p>}
    </div>

  )
}
