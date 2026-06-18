import { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#A8263D', // Carmín
  '#C4614A', // Terra
  '#D4886E', // Salmón
  '#3B5A8A', // Cobalto
  '#3A7D5C', // Bosque
  '#8B1A2F', // Vino oscuro
  '#6366F1', // Índigo
  '#EC4899', // Rosa
  '#8B5CF6', // Violeta
  '#10B981', // Esmeralda
  '#F59E0B', // Ámbar
];

export function TagsPage() {
  const { colors, tags, createTag, deleteTag, tasks } = useApp();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [focused, setFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTaskCountForTag = (tagId: string) => {
    return tasks.filter(t => t.tags.some(tag => tag.id === tagId)).length;
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('El nombre de la etiqueta no puede estar vacío');
      return;
    }

    if (tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast.error('Ya existe una etiqueta con este nombre');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTag(newTagName.trim(), newTagColor);
      setNewTagName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${colors.bg.divider}`, paddingBottom: 16 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: `${colors.accent.wine}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TagIcon size={20} strokeWidth={1.5} style={{ color: colors.accent.carmine }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: colors.text.primary, lineHeight: 1.1 }}>
            Etiquetas
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary }}>
            Crea y organiza las categorías de tus proyectos de estudio y estudio pomodoro.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="tf-responsive-tags-grid">
        {/* Left Column: Create Tag Form */}
        <div
          style={{
            backgroundColor: colors.bg.panel,
            borderRadius: 16,
            border: `1px solid ${colors.bg.divider}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            height: 'fit-content',
          }}
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: colors.text.primary }}>
            Crear Nueva Etiqueta
          </h3>

          {/* Color & Preview Card */}
          <div
            style={{
              borderRadius: 12,
              backgroundColor: colors.bg.card,
              border: `1.5px solid ${colors.bg.divider}`,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 200ms ease',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: newTagColor,
                  boxShadow: `0 0 10px ${newTagColor}44`,
                  transition: 'background-color 200ms ease',
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: newTagName.trim() ? colors.text.primary : colors.text.disabled,
                }}
              >
                {newTagName.trim() || 'Vista previa de etiqueta'}
              </span>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: colors.text.secondary,
                backgroundColor: colors.bg.hover,
                padding: '2px 8px',
                borderRadius: 6,
                textTransform: 'uppercase',
              }}
            >
              {newTagColor}
            </span>
          </div>

          {/* Name Field */}
          <div>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: colors.text.secondary,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Nombre de la Etiqueta
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={25}
              placeholder="Ej. Estudio, Proyecto, Ocio..."
              style={{
                width: '100%',
                height: 40,
                backgroundColor: colors.bg.hover,
                border: `1px solid ${focused ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10,
                padding: '0 14px',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: colors.text.primary,
                outline: 'none',
                transition: 'border-color 120ms ease',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
              {newTagName.length}/25
            </div>
          </div>

          {/* Color Picker presets */}
          <div>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: colors.text.secondary,
                display: 'block',
                marginBottom: 10,
              }}
            >
              Seleccionar Color
            </label>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 12 }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  style={{
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: color,
                    border: `2px solid ${newTagColor === color ? colors.text.primary : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'transform 100ms ease, border-color 100ms ease',
                    transform: newTagColor === color ? 'scale(1.05)' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = newTagColor === color ? 'scale(1.05)' : 'none')}
                />
              ))}

              {/* Custom Color Picker input */}
              <div
                style={{
                  position: 'relative',
                  height: 36,
                  borderRadius: 8,
                  border: `2px solid ${!PRESET_COLORS.includes(newTagColor) ? colors.text.primary : 'transparent'}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 100ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <input
                  type="color"
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  style={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    width: 'calc(100% + 8px)',
                    height: 'calc(100% + 8px)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || isSubmitting}
            style={{
              height: 42,
              borderRadius: 999,
              border: 'none',
              backgroundColor: newTagName.trim() && !isSubmitting ? colors.accent.wine : colors.bg.hover,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: newTagName.trim() && !isSubmitting ? colors.text.primary : colors.text.disabled,
              cursor: newTagName.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
              transition: 'background-color 120ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Plus size={16} strokeWidth={2} />
            {isSubmitting ? 'Añadiendo...' : 'Agregar Etiqueta'}
          </button>
        </div>

        {/* Right Column: Tags List */}
        <div
          style={{
            backgroundColor: colors.bg.panel,
            borderRadius: 16,
            border: `1px solid ${colors.bg.divider}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 500,
            overflowY: 'auto',
          }}
          className="tf-scrollbar"
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: colors.text.primary }}>
            Etiquetas Creadas ({tags.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence initial={false}>
              {tags.map(tag => {
                const count = getTaskCountForTag(tag.id);
                return (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: colors.bg.card,
                        borderRadius: 10,
                        border: `1.5px solid ${colors.bg.divider}`,
                        transition: 'all 120ms ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = colors.text.secondary;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = colors.bg.divider;
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: tag.color,
                            boxShadow: `0 0 8px ${tag.color}33`,
                          }}
                        />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary }}>
                          {tag.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11,
                            color: colors.text.disabled,
                            backgroundColor: colors.bg.hover,
                            padding: '1px 6px',
                            borderRadius: 999,
                          }}
                        >
                          {count} {count === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (count > 0) {
                            if (!window.confirm(`Esta etiqueta está vinculada a ${count} tareas. ¿Estás seguro de que deseas eliminarla? Las tareas no se eliminarán, pero perderán esta etiqueta.`)) {
                              return;
                            }
                          }
                          deleteTag(tag.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.text.disabled,
                          padding: 6,
                          borderRadius: 6,
                          transition: 'all 120ms ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#C0392B';
                          e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = colors.text.disabled;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {tags.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 0',
                  color: colors.text.disabled,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  gap: 8,
                }}
              >
                <AlertCircle size={20} strokeWidth={1.5} />
                No tienes etiquetas creadas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
