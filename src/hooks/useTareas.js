import { useState, useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { formatAnticipacion } from "../utils";

/**
 * Hook que centraliza toda la lógica de tareas.
 * Maneja el estado, persistencia, ordenamiento,
 * filtrado y recordatorios de notificaciones.
 */
export function useTareas() {
  const [tareas, setTareas] = useLocalStorage("tareas", []);
  const [busqueda, setBusqueda] = useState("");
  const notificacionesEnviadas = useRef(new Set());

  // ── Pedir permiso de notificaciones al montar ─────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Revisar recordatorios ─────────────────────────────────
  const revisarRecordatorios = useCallback(() => {
    const ahora = new Date();

    tareas.forEach((tarea) => {
      if (tarea.completada || !tarea.fechaLimite || !tarea.horaTarea) return;

      const fechaHora = new Date(`${tarea.fechaLimite}T${tarea.horaTarea}:00`);
      const diferencia = fechaHora - ahora;
      const anticipacionMs = (tarea.anticipacion ?? 60) * 60000;
      const dentroDelRango = diferencia <= anticipacionMs && diferencia > 0;

      if (dentroDelRango && !notificacionesEnviadas.current.has(tarea.id)) {
        if (Notification.permission === "granted") {
          const minutos = Math.round(diferencia / 60000);
          const mensaje =
            minutos === 0
              ? `"${tarea.texto}" comienza ahora`
              : `"${tarea.texto}" comienza en ${minutos} minuto${minutos !== 1 ? "s" : ""}`;

          new Notification("🔔 Recordatorio de tarea", {
            body: mensaje,
            icon: "/vite.svg",
          });
        }
        notificacionesEnviadas.current.add(tarea.id);
      }
    });
  }, [tareas]);

  useEffect(() => {
    const timeout = setTimeout(revisarRecordatorios, 1000);
    const intervalo = setInterval(revisarRecordatorios, 30000);
    return () => {
      clearTimeout(timeout);
      clearInterval(intervalo);
    };
  }, [revisarRecordatorios]);

  // ── CRUD ──────────────────────────────────────────────────

    function agregarTarea({
    texto,
    prioridad,
    fechaLimite,
    horaTarea,
    anticipacion,
    tieneHora,
  }) {
    if (!texto.trim()) return;

    const nuevaTarea = {
      id: Date.now(),
      texto,
      prioridad,
      fechaLimite,
      horaTarea: tieneHora ? horaTarea : null,
      anticipacion: tieneHora ? anticipacion : null,

      completada: false,
      notificado: false,

      // Preparado para futuras mejoras
      descripcion: "",
      categoria: "",
      favorita: false,
      fijada: false,
      subtareas: [],
    };

    setTareas((prev) => [...prev, nuevaTarea]);
  }

  function editarTarea(id, cambios) {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...cambios, notificado: false } : t,
      ),
    );
    notificacionesEnviadas.current.delete(id);
  }

  function toggleTarea(id) {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)),
    );
  }

  function eliminarTarea(id) {
    setTareas((prev) => prev.filter((t) => t.id !== id));
    notificacionesEnviadas.current.delete(id);
  }
  //  Subtareas

function agregarSubtarea(tareaId, texto) {
  if (!texto.trim()) return
  setTareas(prev => prev.map(t =>
    t.id === tareaId ? {
      ...t,
      subtareas: [
        ...( t.subtareas || []),
        { id: Date.now(), texto, completada: false }
      ]
    } : t
  ))
}

function toggleSubtarea(tareaId, subtareaId) {
  setTareas(prev => prev.map(t =>
    t.id === tareaId ? {
      ...t,
      subtareas: (t.subtareas || []).map(s =>
        s.id === subtareaId ? { ...s, completada: !s.completada } : s
      )
    } : t
  ))
}

function eliminarSubtarea(tareaId, subtareaId) {
  setTareas(prev => prev.map(t =>
    t.id === tareaId ? {
      ...t,
      subtareas: (t.subtareas || []).filter(s => s.id !== subtareaId)
    } : t
  ))
}

  // ── Filtrado y ordenamiento ───────────────────────────────

  function filtrarTareas(lista, filtro) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filtro) {
      case "pendientes":
        return lista.filter((t) => !t.completada);

      case "completadas":
        return lista.filter((t) => t.completada);

      case "hoy":
        return lista.filter((t) => {
          if (!t.fechaLimite) return false;

          return (
            new Date(`${t.fechaLimite}T00:00:00`).getTime() ===
            hoy.getTime()
          );
        });

      case "vencidas":
        return lista.filter((t) => {
          if (!t.fechaLimite || t.completada) return false;

          return new Date(`${t.fechaLimite}T00:00:00`) < hoy;
        });

      default:
        return lista;
    }
  }
  function buscarTareas(lista) {
    if (!busqueda.trim()) return lista;

    const texto = busqueda.toLowerCase().trim();

    return lista.filter((tarea) => {
      return [tarea.texto, tarea.descripcion, tarea.categoria, tarea.prioridad]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(texto));
    });
  }

  function ordenarTareas(lista) {
    const pesoPrioridad = { alta: 1, media: 2, baja: 3 };
    return [...lista].sort((a, b) => {
      if (a.fechaLimite && b.fechaLimite) {
        const diff = new Date(a.fechaLimite) - new Date(b.fechaLimite);
        if (diff !== 0) return diff;
      }
      if (a.fechaLimite && !b.fechaLimite) return -1;
      if (!a.fechaLimite && b.fechaLimite) return 1;
      return pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad];
    });
  }

  function estaVencida(tarea) {
    if (!tarea.fechaLimite || tarea.completada) return false;
    const fechaVencimiento = tarea.horaTarea
      ? new Date(`${tarea.fechaLimite}T${tarea.horaTarea}`)
      : new Date(`${tarea.fechaLimite}T23:59:59`);
    return fechaVencimiento < new Date();
  }

  return {
  // Estado
  tareas,
  busqueda,
  setBusqueda,
  buscarTareas,

  // CRUD
  agregarTarea,
  editarTarea,
  toggleTarea,
  eliminarTarea,

  // Utilidades
  filtrarTareas,
  ordenarTareas,
  estaVencida,
  formatAnticipacion,
  agregarSubtarea,
  toggleSubtarea,
  eliminarSubtarea,
};
}
