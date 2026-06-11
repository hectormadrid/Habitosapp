import Header from './components/Header'
import Botton from './components/Bottom'
import HabitList from './components/HabitList'

export default function App() {
  return (
    <div className="App">
      <Header 
      titulo="Mis Habitos"
      subtitulo="Agrega tus habitos diarios"
      fecha={new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
      />
      <Botton />
    <HabitList />
    </div>

  )
}
