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