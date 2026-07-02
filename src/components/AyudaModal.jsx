import styles from './AyudaModal.module.css'

// Contenido de ayuda por cada pestaña
const CONTENIDO_AYUDA = {
    habitos: {
        titulo: '📋 Hábitos — Cómo funciona',
        secciones: [
            {
                subtitulo: 'Crear un hábito',
                texto: 'Haz clic en "Nuevo" para agregar un hábito. Elige un nombre y un emoji que lo represente.',
            },
            {
                subtitulo: 'Marcar como completado',
                texto: 'Haz clic en el checkbox del día correspondiente para marcar el hábito como cumplido. Puedes desmarcarlo haciendo clic de nuevo.',
            },
            {
                subtitulo: 'Progreso semanal',
                texto: 'El círculo muestra el porcentaje promedio de hábitos cumplidos en los días ya pasados de la semana actual.',
            },
            {
                subtitulo: 'Recuento y progreso diario',
                texto: 'Al final de la tabla verás cuántos hábitos completaste cada día y el porcentaje con un color: verde (100%), verde claro (70-99%), naranja (40-69%) y rojo (menos de 40%).',
            },
            {
                subtitulo: 'Horas de sueño',
                texto: 'Registra cuántas horas dormiste cada día seleccionando un número del 4 al 10.',
            },
            {
                subtitulo: 'Editar o eliminar',
                texto: 'Pasa el cursor sobre un hábito y haz clic en el ícono del lápiz para editarlo o eliminarlo.',
            },
        ],
    },

    tareas: {
        titulo: '✅ Tareas — Cómo funciona',
        secciones: [
            {
                subtitulo: 'Crear una tarea',
                texto: 'Escribe el texto de la tarea, opcionalmente agrega una fecha límite y prioridad, luego haz clic en "Agregar".',
            },
            {
                subtitulo: 'Prioridades',
                texto: '🔴 Alta, 🟡 Media, 🟢 Baja. Las tareas se ordenan automáticamente por fecha y luego por prioridad.',
            },
            {
                subtitulo: 'Agregar hora y recordatorio',
                texto: 'Activa "Agregar hora" para asignarle una hora a la tarea. Aparecerá un selector de anticipación donde puedes elegir con cuánto tiempo de antelación quieres recibir el aviso: desde 5 minutos hasta 1 día antes.',
            },
            {
                subtitulo: 'Notificaciones',
                texto: 'El navegador te avisará automáticamente según la anticipación que elegiste. La primera vez debes aceptar el permiso de notificaciones. Cada tarea solo notifica una vez para no repetir el aviso.',
            },
            {
                subtitulo: 'Filtros',
                texto: 'Usa los botones de filtro para ver Todas, Pendientes, Completadas, las de Hoy o las Vencidas.',
            },
            {
                subtitulo: 'Tareas vencidas',
                texto: 'Si una tarea pasa su fecha límite sin completarse, aparece marcada con ⚠️ Vencida.',
            },
        ],
    },

    estadisticas: {
        titulo: '📊 Estadísticas — Cómo funciona',
        secciones: [
            {
                subtitulo: 'Tarjetas resumen',
                texto: 'Muestran días registrados, días perfectos (100% de hábitos cumplidos), tu racha actual y tu mejor racha histórica.',
            },
            {
                subtitulo: 'Gráfico de barras — últimos 30 días',
                texto: 'Muestra cuántos hábitos completaste cada día durante el último mes.',
            },
            {
                subtitulo: 'Gráfico de líneas — promedio semanal',
                texto: 'Muestra el porcentaje promedio de cumplimiento por semana, durante las últimas 8 semanas.',
            },
            {
                subtitulo: 'Cumplimiento por hábito',
                texto: 'Compara qué porcentaje de veces has cumplido cada hábito desde que lo creaste, para identificar cuáles te cuestan más.',
            },
        ],
    },

    calendario: {
        titulo: '📅 Calendario — Cómo funciona',
        secciones: [
            {
                subtitulo: 'Navegar entre meses',
                texto: 'Usa las flechas ← → para moverte entre meses anteriores y futuros.',
            },
            {
                subtitulo: 'Colores de los días',
                texto: 'Cada día se colorea según tu progreso: verde (100%), verde claro (70-99%), naranja (1-69%) y rojo claro (0%).',
            },
            {
                subtitulo: 'Seleccionar un día',
                texto: 'Haz clic en cualquier día para ver el panel con el detalle: qué hábitos completaste y el porcentaje de progreso.',
            },
            {
                subtitulo: 'Agregar notas',
                texto: 'Dentro del panel del día puedes escribir una nota — útil para recordar eventos o pendientes importantes. Los días con nota guardada muestran un punto azul •.',
            },
        ],
    },
}

export default function AyudaModal({ seccion, onClose }) {
    const contenido = CONTENIDO_AYUDA[seccion]

    if (!contenido) return null

    return (
        <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>

                <div className={styles.header}>
                    <h2 className={styles.titulo}>{contenido.titulo}</h2>
                    <button className={styles.cerrarBtn} onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                <div className={styles.contenido}>
                    {contenido.secciones.map((sec, i) => (
                        <div key={i} className={styles.seccion}>
                            <h3 className={styles.subtitulo}>{sec.subtitulo}</h3>
                            <p className={styles.texto}>{sec.texto}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className={styles.entendidoBtn} onClick={onClose}>Entendido</button>
                </div>

            </div>
        </div>
    )
}