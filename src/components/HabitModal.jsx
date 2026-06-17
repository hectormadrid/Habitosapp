import { EMOJIS, COLORS } from '../constants'
import styles from './HabitModal.module.css'

/**
 * Modal para crear o editar un hábito.
 *
 * Props:
 *  - form         { name, emoji, color } — estado del formulario
 *  - setForm      función para actualizar el formulario
 *  - onSave       función llamada al guardar
 *  - onDelete     función llamada al eliminar (solo en modo edición)
 *  - onClose      función para cerrar el modal
 *  - isEditing    boolean — true si estamos editando un hábito existente
 */
export default function HabitModal({ form, setForm, onSave, onDelete, onClose, isEditing }) {
  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{isEditing ? 'Editar hábito' : 'Nuevo hábito'}</h2>

        {/* Campo de nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Ej: Meditar, Leer, Correr..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSave()}
            autoFocus
          />
        </div>

        {/* Selector de emoji */}
        <div className={styles.group}>
          <label className={styles.label}>Ícono</label>
          <div className={styles.emojiGrid}>
            {EMOJIS.map(em => (
              <button
                key={em}
                className={`${styles.emojiBtn} ${form.emoji === em ? styles.selected : ''}`}
                onClick={() => setForm(f => ({ ...f, emoji: em }))}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de color */}
        <div className={styles.group}>
          <label className={styles.label}>Color</label>
          <div className={styles.colorGrid}>
            {COLORS.map(c => (
              <div
                key={c.name}
                className={`${styles.swatch} ${form.color.name === c.name ? styles.swatchSelected : ''}`}
                style={{ background: c.done }}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                role="button"
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.footer}>
          {isEditing && (
            <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={onDelete}>
              <i className="ti ti-trash" aria-hidden="true" /> Eliminar
            </button>
          )}
          <button className={styles.btn} onClick={onClose}>Cancelar</button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onSave}
            disabled={!form.name.trim()}
          >
            {isEditing ? 'Guardar' : 'Crear hábito'}
          </button>
        </div>
      </div>
    </div>
  )
}
