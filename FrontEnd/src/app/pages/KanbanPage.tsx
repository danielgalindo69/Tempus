import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Play, AlertTriangle, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { TaskCard } from '../components/timeflow/TaskCard';
import { AddTaskModal } from '../components/timeflow/AddTaskModal';
import type { Task, TaskStatus } from '../components/timeflow/types';
import { toast } from 'sonner';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'planned', label: 'Planeado', color: '#3B5A8A' },
  { key: 'progress', label: 'En proceso', color: '#C4914A' },
  { key: 'done', label: 'Terminado', color: '#3A7D5C' },
];

function TaskDrawer({ task, onClose, onDelete }: { task: Task; onClose: () => void; onDelete: (id: string) => void }) {
  const { colors, updateTask, startTimer, timerState } = useApp();
  const [focused, setFocused] = useState('');
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [notes, setNotes] = useState(task.notes || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusColors: Record<string, string> = {
    planned: '#3B5A8A',
    progress: '#C4914A',
    done: '#3A7D5C',
  };

  const handleSave = () => {
    updateTask(task.id, { title, description: desc, status, notes, priority });
    toast.success('Tarea actualizada');
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(task.id);
    onClose();
  };

  const formatSecondsToHms = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="tf-task-drawer"
      style={{
        position: 'fixed',
        right: 0,
        top: 64,
        bottom: 0,
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
            maxLength={100}
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
          <div style={{ textAlign: 'right', fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
            {title.length}/100
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Descripción
          </label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={250}
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
          <div style={{ textAlign: 'right', fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
            {desc.length}/250
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Notas de estudio / progreso
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={500}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused('')}
            rows={4}
            style={{
              width: '100%', backgroundColor: colors.bg.hover,
              border: `1px solid ${focused === 'notes' ? colors.accent.carmine : colors.bg.divider}`,
              borderRadius: 10, padding: '10px 12px', fontFamily: "'Inter', sans-serif",
              fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none',
              transition: 'border-color 120ms ease', boxSizing: 'border-box',
              lineHeight: 1.6,
            }}
            placeholder="Añade aquí apuntes o notas de tu progreso..."
          />
          <div style={{ textAlign: 'right', fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
            {notes.length}/500
          </div>
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

        {/* Priority */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
            Prioridad
          </label>
          <div className="flex gap-2">
            {[
              { key: 'low', label: 'Baja' },
              { key: 'medium', label: 'Media' },
              { key: 'high', label: 'Urgente' },
            ].map(option => {
              const active = priority === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setPriority(option.key as Task['priority'])}
                  style={{
                    flex: 1, height: 32, borderRadius: 8,
                    border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`,
                    backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent',
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                    color: active ? colors.accent.salmon : colors.text.secondary,
                    cursor: 'pointer', transition: 'all 120ms ease',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
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
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 300, color: colors.text.primary }}>
                {task.estimatedSeconds ? formatSecondsToHms(task.estimatedSeconds) : `${task.estimatedTime}min`}
              </p>
            </div>
            <div style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled, marginBottom: 2 }}>Real</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 300, color: colors.text.primary }}>
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
      <div style={{ padding: 20, borderTop: `1px solid ${colors.bg.divider}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
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

        {/* Botón eliminar con confirmación inline */}
        <button
          onClick={handleDelete}
          onMouseLeave={() => setConfirmDelete(false)}
          style={{
            width: '100%', height: 36, borderRadius: 999,
            border: `1px solid ${confirmDelete ? '#9A1B1B' : colors.bg.divider}`,
            backgroundColor: confirmDelete ? 'rgba(154,27,27,0.12)' : 'transparent',
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
            color: confirmDelete ? '#C4614A' : colors.text.disabled,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {confirmDelete ? '⚠️ Confirmar eliminación' : 'Eliminar tarea'}
        </button>
      </div>
    </motion.div>
  );
}



function getWeekDates(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function doesTaskOccurOnDate(task: Task, date: Date) {
  const dateKey = formatDate(date);
  if (task.date === dateKey) {
    return true;
  }

  if (task.recurrence) {
    const { recurrenceStart, recurrenceEnd, repeatDays } = task.recurrence;
    if (dateKey < recurrenceStart) {
      return false;
    }
    if (recurrenceEnd && dateKey > recurrenceEnd) {
      return false;
    }
    const repeatDaysArray = repeatDays.split(',').map(s => parseInt(s, 10));
    const dayOfWeek = date.getDay();
    return repeatDaysArray.includes(dayOfWeek);
  }

  return false;
}

export function KanbanPage() {
  const { tasks, updateTask, deleteTask, colors } = useApp();
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

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    if (selectedTask?.id === id) setSelectedTask(null);
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
        className="tf-responsive-kanban-grid tf-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {COLUMNS.map(col => {
          const weekDates = getWeekDates(weekOffset);
          const colTasks = tasks.filter(t => t.status === col.key && weekDates.some(date => doesTaskOccurOnDate(t, date)));
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

              {/* Botón agregar: SÓLO en columnas planned y progress */}
              {col.key !== 'done' && (
                <button
                  onClick={() => setAddingToColumn(col.key)}
                  className="flex items-center gap-2 w-full"
                  style={{
                    height: 36, borderRadius: 8, border: `1px dashed ${colors.bg.divider}`,
                    backgroundColor: 'transparent', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.disabled,
                    justifyContent: 'center', transition: 'all 120ms ease', marginTop: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colors.text.secondary; e.currentTarget.style.color = colors.text.secondary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = colors.bg.divider; e.currentTarget.style.color = colors.text.disabled; }}
                >
                  <Plus size={13} strokeWidth={1.5} />
                  Agregar tarea
                </button>
              )}
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
            onDelete={handleDeleteTask}
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
