/**
 * Componente de encabezado para mostrar el título, subtítulo y fecha
 * Recibe las props: titulo, subtitulo y fecha para personalizar el contenido del encabezado
 *  
 * */
import styles from './Header.module.css' // Importamos el archivo de estilos CSS para el componente Header
export default function Header({ titulo, subtitulo, fecha }) {
    return (
        <header className={styles.header}>
            <div>
                <h1 className={styles.titulo}> {titulo} </h1>
                <p className={styles.subtitulo}> {subtitulo} </p>
                <p> {fecha} </p>
            </div>
        </header >
    )
}

