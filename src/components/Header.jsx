// Componente de encabezado para mostrar el título, subtítulo y fecha
// Recibe las props: titulo, subtitulo y fecha para personalizar el contenido del encabezado
export default function Header({titulo, subtitulo, fecha  }) {
    return(
        <header>
            <h1> {titulo} </h1>
            <p> {subtitulo} </p> 
            <p> {fecha} </p>
        </header>
    )
}

