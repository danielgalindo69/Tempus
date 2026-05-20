import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Play, Clock, Tag as TagIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { TaskCard } from '../components/timeflow/TaskCard';
import type { Task, TaskStatus } from '../components/timeflow/types';
import { toast } from 'sonner';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'planned', label: 'Planeado', color: '#3B5A8A' },
  { key: 'progress', label: 'En proceso', color: '#C4914A' },
  { key: 'done', label: 'Terminado', color: '#3A7D5C' },
];

function TaskDrawer({ task, onClose }: { task: Task; onClose: () => void }) {
  const { colors, updateTask, startTimer, timerState } = useApp();
  const [focused, setFocused] = useState('');
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  const statusColors: Record<string, string> = {
    planned: '#3B5A8A',
    progress: '#C4914A',
    done: '#3A7D5C',
  };

  const handleSave = () => {
    updateTask(task.id, { title, description: desc, status });
    toast.success('Tarea actualizada');
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        right: 0,
        top: 64,
        bottom: 0,
        width: 400,
        backgroundColor: colors.bg.panel,
        borderLeft: `1px solid ${colors.bg.divider}`,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.bg.divider}` }}
      >
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: colors.text.primary }}>
          Detalle de tarea
        </h3>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
        </button>
      </div>

      <div className="flex-1 overflow-auto tf-scrollbar" style={{ padding: 24 }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Título
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setFocused('title')}
            onBlur={() => setFocused('')}
            style={{
              width: '100%', height: 40, backgroundColor: colors.bg.hover,
              border: `1px solid ${focused === 'title' ? colors.accent.carmine : colors.bg.divider}`,
              borderRadius: 10, padding: '0 12px', fontFamily: "'Inter', sans-serif",
              fontSize: 14, color: colors.text.primary, outline: 'none',
              transition: 'border-color 120ms ease', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Descripción
          </label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onFocus={() => setFocused('desc')}
            onBlur={() => setFocused('')}
            rows={3}
            style={{
              width: '100%', backgroundColor: colors.bg.hover,
              border: `1px solid ${focused === 'desc' ? colors.accent.carmine : colors.bg.divider}`,
              borderRadius: 10, padding: '10px 12px', fontFamily: "'Inter', sans-serif",
              fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none',
              transition: 'border-color 120ms ease', boxSizing: 'border-box',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Estado
          </label>
          <div className="flex gap-2">
            {COLUMNS.map(col => (
              <button
                key={col.key}
                onClick={() => setStatus(col.key)}
                style={{
                  flex: 1, height: 32, borderRadius: 8,
                  border: `1px solid ${status === col.key ? col.color : colors.bg.divider}`,
                  backgroundColor: status === col.key ? `${col.color}22` : 'transparent',
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                  color: status === col.key ? col.color : colors.text.secondary,
                  cursor: 'pointer', transition: 'all 120ms ease',
                }}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {task.tags.map(tag => (
              <span
                key={tag.id}
                style={{
                  backgroundColor: `${tag.color}33`, color: tag.color, fontSize: 11,
                  fontWeight: 500, fontFamily: "'Inter', sans-serif",
                  padding: '3px 10px', borderRadius: 6,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Time info */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>
            Tiempo
          </label>
          <div className="flex gap-3">
            <div style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled, marginBottom: 2 }}>Estimado</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 300, color: colors.text.primary }}>
                {task.estimatedTime}min
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled, marginBottom: 2 }}>Real</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 300, color: colors.text.primary }}>
                {task.actualTime}min
              </p>
            </div>
          </div>
        </div>

        {/* Sessions */}
        {task.sessions.length > 0 && (
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>
              Historial de sesiones
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {task.sessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between"
                  style={{ backgroundColor: colors.bg.card, borderRadius: 8, padding: '8px 12px' }}
                >
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.primary }}>{session.label}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>{session.date}</p>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 300, color: colors.text.secondary }}>
                    {session.duration >= 60 ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}min` : `${session.duration}min`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: 20, borderTop: `1px solid ${colors.bg.divider}`, display: 'flex', gap: 10 }}>
        {task.status !== 'done' && (
          <button
            onClick={() => { startTimer(task.id); onClose(); }}
            disabled={timerState.isActive}
            style={{
              flex: 1, height: 40, borderRadius: 999,
              backgroundColor: timerState.isActive ? colors.bg.hover : colors.accent.wine,
              border: 'none', cursor: timerState.isActive ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
              color: timerState.isActive ? colors.text.disabled : colors.text.primary,
              transition: 'background-color 120ms ease',
            }}
          >
            <Play size={13} strokeWidth={1.5} />
            Iniciar cronómetro
          </button>
        )}
        <button
          onClick={handleSave}
          style={{
            flex: 1, height: 40, borderRadius: 999,
            border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent',
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary,
            cursor: 'pointer',
          }}
        >
          Guardar
        </button>
      </div>
    </motion.div>
  );
}

function AddTaskModal({ column, onClose }: { column: TaskStatus; onClose: () => void }) {
  const { colors, addTask, tags } = useApp();
  const [title, setTitle] = useState('');
  const [estimate, setEstimate] = useState('60');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [focused, setFocused] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addTask({
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: '',
      status: column,
      tags: tags.filter(t => selectedTags.includes(t.id)),
      estimatedTime: parseInt(estimate) || 60,
      actualTime: 0,
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      sessions: [],
    });
    toast.success('Tarea creada');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(13,13,13,0.75)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, backgroundColor: colors.bg.panel,
          borderRadius: 16, border: `1px solid ${colors.bg.divider}`, padding: 32,
        }}
      >
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: colors.text.primary, marginBottom: 24 }}>
          Nueva tarea
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>Título</label>
            <input
              autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
              placeholder="Nombre de la tarea"
              style={{
                width: '100%', height: 40, backgroundColor: colors.bg.hover,
                border: `1px solid ${focused === 'title' ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10, padding: '0 12px', fontFamily: "'Inter', sans-serif",
                fontSize: 14, color: colors.text.primary, outline: 'none',
                transition: 'border-color 120ms ease', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>Tiempo estimado (min)</label>
            <input
              type="number" value={estimate} onChange={e => setEstimate(e.target.value)}
              onFocus={() => setFocused('est')} onBlur={() => setFocused('')}
              style={{
                width: '100%', height: 40, backgroundColor: colors.bg.hover,
                border: `1px solid ${focused === 'est' ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10, padding: '0 12px', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14, fontWeight: 300, color: colors.text.primary, outline: 'none',
                transition: 'border-color 120ms ease', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const sel = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTags(prev => sel ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                    style={{
                      padding: '3px 10px', borderRadius: 6, border: `1px solid ${sel ? tag.color : colors.bg.divider}`,
                      backgroundColor: sel ? `${tag.color}33` : 'transparent', fontSize: 11,
                      fontWeight: 500, fontFamily: "'Inter', sans-serif",
                      color: sel ? tag.color : colors.text.secondary, cursor: 'pointer', transition: 'all 120ms ease',
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose}
            style={{ flex: 1, height: 40, borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleAdd} disabled={!title.trim()}
            style={{ flex: 1, height: 40, borderRadius: 999, border: 'none', backgroundColor: title.trim() ? colors.accent.wine : colors.bg.hover, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: title.trim() ? colors.text.primary : colors.text.disabled, cursor: title.trim() ? 'pointer' : 'not-allowed', transition: 'background-color 120ms ease' }}>
            Agregar tarea
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function KanbanPage() {
  const { tasks, updateTask, colors } = useApp();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const handleDrop = (column: TaskStatus) => {
    if (draggedId) {
      updateTask(draggedId, { status: column });
      toast.success(`Tarea movida a ${COLUMNS.find(c => c.key === column)?.label}`);
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '16px 32px',
          borderBottom: `1px solid ${colors.bg.divider}`,
          backgroundColor: colors.bg.page,
        }}
      >
        <div className="flex items-center gap-4">
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: colors.text.primary }}>
            Tablero
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
            </button>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary, padding: '0 8px' }}>
              {weekOffset === 0 ? 'Esta semana' : weekOffset < 0 ? `Hace ${Math.abs(weekOffset)} sem.` : `En ${weekOffset} sem.`}
            </span>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
            </button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          padding: '24px 32px',
          overflowY: 'auto',
        }}
        className="tf-scrollbar"
      >
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          const isDropTarget = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOverColumn(col.key); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => handleDrop(col.key)}
              style={{
                backgroundColor: isDropTarget ? `${colors.bg.hover}66` : colors.bg.panel,
                borderRadius: 16,
                border: `1px ${isDropTarget ? 'dashed' : 'solid'} ${isDropTarget ? colors.accent.wine : colors.bg.divider}`,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 150ms ease',
                minHeight: 300,
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.primary }}>
                    {col.label}
                  </span>
                  <span
                    style={{
                      backgroundColor: colors.bg.hover, borderRadius: 999,
                      padding: '1px 7px', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, fontWeight: 300, color: colors.text.secondary,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    draggable
                    onDragStart={id => setDraggedId(id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverColumn(null); }}
                    isDragging={draggedId === task.id}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>

              {/* Add task button */}
              <button
                onClick={() => setAddingToColumn(col.key)}
                className="flex items-center gap-2 w-full"
                style={{
                  height: 36, borderRadius: 8, border: `1px dashed ${colors.bg.divider}`,
                  backgroundColor: 'transparent', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.disabled,
                  justifyContent: 'center', transition: 'all 120ms ease', marginTop: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colors.text.secondary;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.bg.divider;
                  e.currentTarget.style.color = colors.text.disabled;
                }}
              >
                <Plus size={13} strokeWidth={1.5} />
                Agregar tarea
              </button>
            </div>
          );
        })}
      </div>

      {/* Task drawer */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </AnimatePresence>

      {/* Add task modal */}
      <AnimatePresence>
        {addingToColumn && (
          <AddTaskModal
            column={addingToColumn}
            onClose={() => setAddingToColumn(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
