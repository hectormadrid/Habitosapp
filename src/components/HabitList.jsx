/**
 * Componente que muestra una lista de hábitos
 * Utiliza el hook useState para manejar el estado de los hábitos y renderiza una lista de ellos en la interfaz de usuario.
 * Cada hábito tiene un id y un nombre, y se muestra en una lista desordenada (ul) con cada hábito como un elemento de lista (li).
 *  */

import { useState } from 'react'

export default function HabitList() {
    const [habitos, setHabitos] = useState([
        { id: 1, nombre: 'Leer' },
        { id: 2, nombre: 'Ejercicio' },
        { id: 3, nombre: 'Meditar' },
    ])

    const [input, setInput] = useState('')

    function agregarHabito() {
        if (!input.trim()) return
        setHabitos([...habitos, { id: Date.now(), nombre: input }])
        setInput('')
    }

    function eliminarHabito(id) {
        setHabitos(habitos.filter(h => h.id !== id))
    }

    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Nuevo hábito..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregarHabito()}
                />
                <button onClick={agregarHabito}>Agregar</button>
            </div>

            <ul>
                {habitos.map(habito => (
                    <li key={habito.id}>
                        {habito.nombre}
                        <button onClick={() => eliminarHabito(habito.id)}>✕</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}