import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Play, AlertTriangle, Zap } from 'lucide-react';
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

const MAX_TASK_DURATION_SECONDS = 10 * 60 * 60;

function TaskDrawer({ task, onClose }: { task: Task; onClose: () => void }) {
  const { colors, updateTask, startTimer, timerState } = useApp();
  const [focused, setFocused] = useState('');
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [notes, setNotes] = useState(task.notes || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);

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
  const [desc, setDesc] = useState('');
  const [notes, setNotes] = useState('');

  // Tiempo detallado
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  // Recurrencia
  const [isWeekly, setIsWeekly] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [isUrgent, setIsUrgent] = useState(false);
  const [focused, setFocused] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUrgentToggle = () => {
    const next = !isUrgent;
    setIsUrgent(next);
    if (next) setPriority('high');
  };

  const clampDurationPart = (value: string, max: number) => {
    const numericValue = Number.parseInt(value, 10);
    if (Number.isNaN(numericValue)) return '0';
    return String(Math.min(max, Math.max(0, numericValue)));
  };

  const updateHours = (value: string) => {
    const nextHours = clampDurationPart(value, 10);
    setHours(nextHours);

    if (Number(nextHours) === 10) {
      setMinutes('0');
      setSeconds('0');
    }
  };

  const updateMinutes = (value: string) => {
    setMinutes(Number(hours) >= 10 ? '0' : clampDurationPart(value, 59));
  };

  const updateSeconds = (value: string) => {
    setSeconds(Number(hours) >= 10 ? '0' : clampDurationPart(value, 59));
  };

  const DAYS_CONFIG = [
    { key: 1, label: 'L' },
    { key: 2, label: 'M' },
    { key: 3, label: 'M' },
    { key: 4, label: 'J' },
    { key: 5, label: 'V' },
    { key: 6, label: 'S' },
    { key: 0, label: 'D' },
  ];

  const toggleDay = (dayKey: number) => {
    setRepeatDays(prev =>
      prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleAdd = async () => {
    if (!title.trim() || isSubmitting) return;

    // Calcular duración en segundos
    const hrsVal = Math.min(10, Math.max(0, parseInt(hours) || 0));
    const minsVal = hrsVal >= 10 ? 0 : Math.min(59, Math.max(0, parseInt(minutes) || 0));
    const secsVal = hrsVal >= 10 ? 0 : Math.min(59, Math.max(0, parseInt(seconds) || 0));
    const totalSeconds = hrsVal * 3600 + minsVal * 60 + secsVal;

    if (totalSeconds <= 0) {
      toast.error('La duracion debe ser mayor a 0 segundos');
      return;
    }

    if (totalSeconds > MAX_TASK_DURATION_SECONDS) {
      toast.error('La tarea no puede durar mas de 10 horas');
      return;
    }

    setIsSubmitting(true);

    const recurrencePayload = isWeekly && repeatDays.length > 0 ? {
      repeatDays: repeatDays.sort((a, b) => a - b).join(','),
      recurrenceStart: new Date().toISOString().split('T')[0],
      recurrenceEnd: null
    } : undefined;

    try {
      await addTask({
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: desc.trim(),
        notes: notes.trim() || undefined,
        estimatedSeconds: totalSeconds,
        status: column,
        tags: tags.filter(t => selectedTags.includes(t.id)),
        estimatedTime: Math.ceil(totalSeconds / 60) || 60,
        actualTime: 0,
        date: new Date().toISOString().split('T')[0],
        priority: isUrgent ? 'high' : priority,
        sessions: [],
        recurrence: recurrencePayload,
      } as any);

      toast.success('tarea creada con éxito');
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle, rgba(13,13,13,0.3) 0%, rgba(5,5,5,0.92) 80%), radial-gradient(circle, rgba(154,27,27,0.12) 0%, transparent 60%)',
        backdropFilter: 'blur(14px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 580,
          backgroundColor: `${colors.bg.panel}EE`,
          borderRadius: 20,
          border: `1px solid ${isUrgent ? colors.accent.carmine : colors.bg.divider}`,
          padding: '36px',
          boxShadow: isUrgent ? `0 0 0 1px ${colors.accent.carmine}44, 0 24px 64px rgba(168,38,61,0.2)` : '0 24px 64px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        className="tf-scrollbar"
      >
        {/* Header con toggle urgente */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: colors.text.primary }}>
            Nueva tarea
          </h3>
          <button
            onClick={handleUrgentToggle}
            className="flex items-center gap-1.5"
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: `1.5px solid ${isUrgent ? colors.accent.carmine : colors.bg.divider}`,
              backgroundColor: isUrgent ? `${colors.accent.carmine}22` : 'transparent',
              cursor: 'pointer',
              transition: 'all 180ms ease',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: isUrgent ? colors.accent.salmon : colors.text.disabled,
              textTransform: 'uppercase',
            }}
          >
            <Zap size={12} strokeWidth={2} style={{ fill: isUrgent ? colors.accent.salmon : 'none' }} />
            Urgente
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Título */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Título</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{title.length}/100</span>
            </div>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused('')}
              placeholder="Nombre de la tarea"
              style={{
                width: '100%', height: 42, backgroundColor: colors.bg.hover,
                border: `1px solid ${focused === 'title' ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10, padding: '0 14px', fontFamily: "'Inter', sans-serif",
                fontSize: 14, color: colors.text.primary, outline: 'none',
                transition: 'border-color 120ms ease', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Descripción corta */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Descripción corta</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{desc.length}/250</span>
            </div>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              maxLength={250}
              rows={2}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused('')}
              placeholder="Resume de qué trata esta tarea..."
              style={{
                width: '100%', backgroundColor: colors.bg.hover,
                border: `1px solid ${focused === 'desc' ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10, padding: '10px 14px', fontFamily: "'Inter', sans-serif",
                fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none',
                transition: 'border-color 120ms ease', boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Notas de Estudio / Progreso */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Notas de estudio o progreso</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{notes.length}/500</span>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused('')}
              placeholder="Ingresa apuntes iniciales, recursos o metas de progreso..."
              style={{
                width: '100%', backgroundColor: colors.bg.hover,
                border: `1px solid ${focused === 'notes' ? colors.accent.carmine : colors.bg.divider}`,
                borderRadius: 10, padding: '10px 14px', fontFamily: "'Inter', sans-serif",
                fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none',
                transition: 'border-color 120ms ease', boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Duración personalizada (H:M:S) */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
              Duración personalizada
            </label>
            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: colors.text.disabled, display: 'block', marginBottom: 4 }}>Horas</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={hours}
                  onChange={e => updateHours(e.target.value)}
                  style={{
                    width: '100%', height: 38, backgroundColor: colors.bg.hover,
                    border: `1px solid ${colors.bg.divider}`, borderRadius: 8,
                    textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14, color: colors.text.primary, outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: colors.text.disabled, display: 'block', marginBottom: 4 }}>Minutos</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={e => updateMinutes(e.target.value)}
                  style={{
                    width: '100%', height: 38, backgroundColor: colors.bg.hover,
                    border: `1px solid ${colors.bg.divider}`, borderRadius: 8,
                    textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14, color: colors.text.primary, outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: colors.text.disabled, display: 'block', marginBottom: 4 }}>Segundos</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={e => updateSeconds(e.target.value)}
                  style={{
                    width: '100%', height: 38, backgroundColor: colors.bg.hover,
                    border: `1px solid ${colors.bg.divider}`, borderRadius: 8,
                    textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14, color: colors.text.primary, outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Repetición semanal */}
          <div style={{ padding: '12px 14px', backgroundColor: `${colors.bg.hover}50`, borderRadius: 12, border: `1px solid ${colors.bg.divider}` }}>
            <div className="flex items-center justify-between" style={{ marginBottom: isWeekly ? 12 : 0 }}>
              <div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.primary, display: 'block' }}>
                  Repetir tarea semanal
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>
                  Permite repetir la tarea días específicos de la semana
                </span>
              </div>
              <button
                onClick={() => setIsWeekly(!isWeekly)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  backgroundColor: isWeekly ? colors.accent.carmine : colors.text.disabled,
                  border: 'none', position: 'relative', cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                }}
              >
                <motion.div
                  layout
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    backgroundColor: colors.text.primary, position: 'absolute',
                    top: 3, left: isWeekly ? 23 : 3,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {isWeekly && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 justify-center py-1"
              >
                {DAYS_CONFIG.map(day => {
                  const active = repeatDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      onClick={() => toggleDay(day.key)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`,
                        backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent',
                        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                        color: active ? colors.accent.salmon : colors.text.secondary,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>Prioridad</label>
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
                    className="flex items-center justify-center gap-1.5"
                    style={{
                      flex: 1, height: 36, borderRadius: 8,
                      border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`,
                      backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent',
                      fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                      color: active ? colors.accent.salmon : colors.text.secondary,
                      cursor: 'pointer', transition: 'all 120ms ease',
                    }}
                  >
                    {option.key === 'high' && <AlertTriangle size={13} strokeWidth={1.5} />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>Tags</label>
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
            style={{ flex: 1, height: 42, borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || isSubmitting}
            style={{
              flex: 1, height: 42, borderRadius: 999, border: 'none',
              backgroundColor: title.trim() && !isSubmitting ? colors.accent.wine : colors.bg.hover,
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
              color: title.trim() && !isSubmitting ? colors.text.primary : colors.text.disabled,
              cursor: title.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
              transition: 'background-color 120ms ease',
            }}
          >
            {isSubmitting ? 'Creando...' : 'Agregar tarea'}
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
