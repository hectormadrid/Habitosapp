/**
 * Componente que muestra una lista de hábitos
 * Utiliza el hook useState para manejar el estado de los hábitos y renderiza una lista de ellos en la interfaz de usuario.
 * Cada hábito tiene un id y un nombre, y se muestra en una lista desordenada (ul) con cada hábito como un elemento de lista (li).
 *  */

import { useState, useEffect } from 'react'// Importamos los hooks useState y useEffect de React para manejar el estado y los efectos secundarios en el componente
import styles from './HabitList.module.css' // Importamos el archivo de estilos CSS para el componente HabitList
import HabitItem from './HabitIteam' // Importamos el componente HabitItem para renderizar cada hábito individualmente en la lista

// Estado inicial con algunos hábitos predefinidos para mostrar en la lista
export default function HabitList() {
    const [habitos, setHabitos] = useState(() => {
        const guardados = localStorage.getItem('habitos') // Si hay hábitos guardados en localStorage, los parseamos y los usamos como estado inicial
        return guardados ? JSON.parse(guardados) : [// Si no hay hábitos guardados, usamos un estado inicial con algunos hábitos predefinidos
            { id: 1, nombre: 'Leer', completado: false },
            { id: 2, nombre: 'Ejercicio', completado: false },
            { id: 3, nombre: 'Meditar', completado: false },
        ]
    })
    // Estado para manejar el valor del input del nuevo hábito
    const [input, setInput] = useState('')

    // useEffect para guardar los hábitos en localStorage cada vez que cambian
    useEffect(() => {
        localStorage.setItem('habitos', JSON.stringify(habitos))
    }, [habitos])

    // Función para agregar un nuevo hábito a la lista
    function agregarHabito() {
        if (!input.trim()) return
        setHabitos([...habitos, { id: Date.now(), nombre: input }])
        setInput('')
    }

    // Función para eliminar un hábito de la lista por su id
    function eliminarHabito(id) {
        setHabitos(habitos.filter(h => h.id !== id))
    }

    function toggleHabito(id) {
        setHabitos(habitos.map(h =>
            h.id === id ? { ...h, completado: !h.completado } : h))
    }

    const habitosCompletados = habitos.filter(h => h.completado).length

    // Renderiza la interfaz de usuario con un input para agregar nuevos hábitos y una lista de hábitos existentes
    // Input para agregar un nuevo hábito, con un botón para agregarlo a la lista
    // Lista de hábitos, cada uno con un checkbox para marcarlo como completado y un botón para eliminarlo
    return (
        <div className={styles.container}>
            <p className={styles.progress}>{habitosCompletados} de {habitos.length} completados hoy</p>
            <div className={styles.inputRow}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Nuevo hábito..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregarHabito()} />
                <button className={styles.addBtn} onClick={agregarHabito}>Agregar</button>
            </div>
            <ul className={styles.list}>
                {habitos.map(habito => (
                    <HabitItem
                        key={habito.id}
                        habito={habito}
                        onToggle={toggleHabito}
                        onEliminar={eliminarHabito}
                    />
                ))}
            </ul>
        </div>
    )
}