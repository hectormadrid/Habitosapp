import { useState, useEffect } from "react";
import { load, save } from "../utils";

/**
 * Hook que sincroniza un estado con localStorage automáticamente.
 * Funciona igual que useState pero persiste el valor entre recargas.
 *
 * @param {string} key      - Clave de localStorage
 * @param {*}      initial  - Valor inicial si la clave no existe
 * @returns [value, setValue]
 *
 * Uso:
 *   const [habits, setHabits] = useLocalStorage('ht_habits', [])
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));

  useEffect(() => {
    save(key, value);
  }, [key, value]);

  return [value, setValue];
}
