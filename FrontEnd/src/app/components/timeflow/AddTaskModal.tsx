import { useState } from 'react';
import { Plus, X, AlertTriangle, Zap, Minus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from './AppContext';
import type { Task, TaskStatus } from './types';

const MAX_TASK_DURATION_SECONDS = 10 * 60 * 60;

const DAYS_CONFIG = [
  { key: 1, label: 'L' },
  { key: 2, label: 'M' },
  { key: 3, label: 'M' },
  { key: 4, label: 'J' },
  { key: 5, label: 'V' },
  { key: 6, label: 'S' },
  { key: 0, label: 'D' },
];

interface AddTaskModalProps {
  /** Columna/estado inicial de la tarea. Nunca acepta 'done'. */
  column?: TaskStatus;
  onClose: () => void;
}

export function AddTaskModal({ column = 'planned', onClose }: AddTaskModalProps) {
  // La columna nunca puede ser 'done' al crear una tarea nueva
  const safeColumn: TaskStatus = column === 'done' ? 'planned' : column;

  const { colors, addTask, tags } = useApp();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [notes, setNotes] = useState('');

  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWeekly, setIsWeekly] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [isUrgent, setIsUrgent] = useState(false);
  const [focused, setFocused] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');

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
    if (Number(nextHours) === 10) { setMinutes('0'); setSeconds('0'); }
  };
  const updateMinutes = (value: string) => setMinutes(Number(hours) >= 10 ? '0' : clampDurationPart(value, 59));
  const updateSeconds = (value: string) => setSeconds(Number(hours) >= 10 ? '0' : clampDurationPart(value, 59));

  const renderDurationInput = (
    label: string, value: string,
    onStepUp: () => void, onStepDown: () => void,
    onChange: (val: string) => void, min: number, max: number, focusKey: string
  ) => {
    const isFocused = focused === focusKey;
    return (
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, color: colors.text.disabled, display: 'block', marginBottom: 4 }}>{label}</span>
        <div style={{
          display: 'flex', alignItems: 'center', backgroundColor: colors.bg.hover,
          borderRadius: 8, border: `1px solid ${isFocused ? colors.accent.carmine : colors.bg.divider}`,
          padding: '2px', boxShadow: isFocused ? `0 0 0 2px ${colors.accent.carmine}22` : 'none', transition: 'all 120ms ease',
        }}>
          <button type="button" onClick={onStepDown} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: colors.text.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.bg.divider; e.currentTarget.style.color = colors.text.primary; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.text.secondary; }}>
            <Minus size={13} />
          </button>
          <input type="number" min={min} max={max} value={value}
            onFocus={() => setFocused(focusKey)} onBlur={() => setFocused('')}
            onChange={e => onChange(e.target.value)}
            style={{ flex: 1, width: '100%', height: 32, backgroundColor: 'transparent', border: 'none', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: colors.text.primary, outline: 'none', padding: 0 }} />
          <button type="button" onClick={onStepUp} style={{ width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: colors.text.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.bg.divider; e.currentTarget.style.color = colors.text.primary; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.text.secondary; }}>
            <Plus size={13} />
          </button>
        </div>
      </div>
    );
  };

  const toggleDay = (dayKey: number) =>
    setRepeatDays(prev => prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]);

  const handleAdd = async () => {
    if (!title.trim() || isSubmitting) return;

    const selectedYear = parseInt(scheduledDate.split('-')[0], 10);
    if (!scheduledDate || selectedYear < 2026) {
      setDateError('La fecha debe ser a partir del año 2026.');
      return;
    }
    setDateError('');

    const hrsVal = Math.min(10, Math.max(0, parseInt(hours) || 0));
    const minsVal = hrsVal >= 10 ? 0 : Math.min(59, Math.max(0, parseInt(minutes) || 0));
    const secsVal = hrsVal >= 10 ? 0 : Math.min(59, Math.max(0, parseInt(seconds) || 0));
    const totalSeconds = hrsVal * 3600 + minsVal * 60 + secsVal;

    if (totalSeconds <= 0) { toast.error('La duración debe ser mayor a 0 segundos'); return; }
    if (totalSeconds > MAX_TASK_DURATION_SECONDS) { toast.error('La tarea no puede durar más de 10 horas'); return; }

    setIsSubmitting(true);

    const recurrencePayload = isWeekly && repeatDays.length > 0 ? {
      repeatDays: repeatDays.sort((a, b) => a - b).join(','),
      recurrenceStart: scheduledDate,
      recurrenceEnd: null,
    } : undefined;

    try {
      await addTask({
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: desc.trim(),
        notes: notes.trim() || undefined,
        estimatedSeconds: totalSeconds,
        status: safeColumn,
        tags: tags.filter(t => selectedTags.includes(t.id)),
        estimatedTime: Math.ceil(totalSeconds / 60) || 60,
        actualTime: 0,
        date: scheduledDate,
        priority: isUrgent ? 'high' : priority,
        sessions: [],
        recurrence: recurrencePayload,
      } as any);

      toast.success('Tarea creada con éxito');
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(circle, rgba(13,13,13,0.3) 0%, rgba(5,5,5,0.92) 80%), radial-gradient(circle, rgba(154,27,27,0.12) 0%, transparent 60%)',
        backdropFilter: 'blur(14px)', zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 580, backgroundColor: `${colors.bg.panel}EE`, borderRadius: 20,
          border: `1px solid ${isUrgent ? colors.accent.carmine : colors.bg.divider}`,
          padding: '36px',
          boxShadow: isUrgent ? `0 0 0 1px ${colors.accent.carmine}44, 0 24px 64px rgba(168,38,61,0.2)` : '0 24px 64px rgba(0,0,0,0.5)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        className="tf-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: colors.text.primary }}>
            Nueva tarea
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={handleUrgentToggle} className="flex items-center gap-1.5"
              style={{
                padding: '6px 14px', borderRadius: 999,
                border: `1.5px solid ${isUrgent ? colors.accent.carmine : colors.bg.divider}`,
                backgroundColor: isUrgent ? `${colors.accent.carmine}22` : 'transparent',
                cursor: 'pointer', transition: 'all 180ms ease',
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                letterSpacing: '0.05em',
                color: isUrgent ? colors.accent.salmon : colors.text.disabled,
                textTransform: 'uppercase',
              }}>
              <Zap size={12} strokeWidth={2} style={{ fill: isUrgent ? colors.accent.salmon : 'none' }} />
              Urgente
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <X size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Título */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Título</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{title.length}/100</span>
            </div>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
              onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
              placeholder="Nombre de la tarea"
              style={{ width: '100%', height: 42, backgroundColor: colors.bg.hover, border: `1px solid ${focused === 'title' ? colors.accent.carmine : colors.bg.divider}`, boxShadow: focused === 'title' ? `0 0 0 2px ${colors.accent.carmine}22` : 'none', borderRadius: 10, padding: '0 14px', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, outline: 'none', transition: 'all 150ms ease', boxSizing: 'border-box' }} />
          </div>

          {/* Descripción */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Descripción corta</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{desc.length}/250</span>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} maxLength={250} rows={2}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
              placeholder="Resume de qué trata esta tarea..."
              style={{ width: '100%', backgroundColor: colors.bg.hover, border: `1px solid ${focused === 'desc' ? colors.accent.carmine : colors.bg.divider}`, boxShadow: focused === 'desc' ? `0 0 0 2px ${colors.accent.carmine}22` : 'none', borderRadius: 10, padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none', transition: 'all 150ms ease', boxSizing: 'border-box', lineHeight: 1.5 }} />
          </div>

          {/* Notas */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary }}>Notas de estudio o progreso</label>
              <span style={{ fontSize: 11, color: colors.text.disabled }}>{notes.length}/500</span>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} rows={3}
              onFocus={() => setFocused('notes')} onBlur={() => setFocused('')}
              placeholder="Ingresa apuntes iniciales, recursos o metas de progreso..."
              style={{ width: '100%', backgroundColor: colors.bg.hover, border: `1px solid ${focused === 'notes' ? colors.accent.carmine : colors.bg.divider}`, boxShadow: focused === 'notes' ? `0 0 0 2px ${colors.accent.carmine}22` : 'none', borderRadius: 10, padding: '10px 14px', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, outline: 'none', resize: 'none', transition: 'all 150ms ease', boxSizing: 'border-box', lineHeight: 1.5 }} />
          </div>

          {/* Duración */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>Duración estimada</label>
            <div className="flex gap-3">
              {renderDurationInput('Horas', hours, () => updateHours(String((parseInt(hours) || 0) + 1)), () => updateHours(String((parseInt(hours) || 0) - 1)), updateHours, 0, 10, 'hours')}
              {renderDurationInput('Minutos', minutes, () => updateMinutes(String((parseInt(minutes) || 0) + 1)), () => updateMinutes(String((parseInt(minutes) || 0) - 1)), updateMinutes, 0, 59, 'minutes')}
              {renderDurationInput('Segundos', seconds, () => updateSeconds(String((parseInt(seconds) || 0) + 1)), () => updateSeconds(String((parseInt(seconds) || 0) - 1)), updateSeconds, 0, 59, 'seconds')}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>Fecha programada</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: colors.bg.hover, borderRadius: 10, border: `1px solid ${focused === 'date' ? colors.accent.carmine : colors.bg.divider}`, boxShadow: focused === 'date' ? `0 0 0 2px ${colors.accent.carmine}22` : 'none', padding: '0 14px', transition: 'all 150ms ease' }}>
              <Calendar size={15} style={{ color: colors.text.secondary, marginRight: 10, flexShrink: 0 }} />
              <input type="date" value={scheduledDate} min="2026-01-01"
                onChange={e => { const val = e.target.value; setScheduledDate(val); const year = parseInt(val.split('-')[0], 10); if (year >= 2026) setDateError(''); }}
                onFocus={() => setFocused('date')} onBlur={() => setFocused('')}
                style={{ flex: 1, height: 42, backgroundColor: 'transparent', border: 'none', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {dateError && (
              <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 6, backgroundColor: 'rgba(154,27,27,0.1)', border: '1px solid rgba(154,27,27,0.3)', fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#C4614A', display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ {dateError}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              {[
                { label: 'Hoy', getValue: () => new Date().toISOString().split('T')[0] },
                { label: 'Mañana', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; } },
                { label: 'Próx. Lunes', getValue: () => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day)); return d.toISOString().split('T')[0]; } },
              ].map(opt => {
                const optVal = opt.getValue();
                const active = scheduledDate === optVal;
                return (
                  <button key={opt.label} type="button" onClick={() => setScheduledDate(optVal)}
                    style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`, backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent', fontSize: 11, fontWeight: 500, color: active ? colors.accent.salmon : colors.text.secondary, cursor: 'pointer', transition: 'all 120ms ease' }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrencia */}
          <div style={{ padding: '12px 14px', backgroundColor: `${colors.bg.hover}50`, borderRadius: 12, border: `1px solid ${colors.bg.divider}` }}>
            <div className="flex items-center justify-between" style={{ marginBottom: isWeekly ? 12 : 0 }}>
              <div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.primary, display: 'block' }}>Repetir tarea semanal</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>Permite repetir la tarea días específicos de la semana</span>
              </div>
              <button onClick={() => setIsWeekly(!isWeekly)}
                style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: isWeekly ? colors.accent.carmine : colors.text.disabled, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background-color 200ms ease' }}>
                <motion.div layout style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: colors.text.primary, position: 'absolute', top: 3, left: isWeekly ? 23 : 3 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
            </div>
            <AnimatePresence>
              {isWeekly && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 justify-center py-1">
                  {DAYS_CONFIG.map(day => {
                    const active = repeatDays.includes(day.key);
                    return (
                      <button key={day.key} onClick={() => toggleDay(day.key)}
                        style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`, backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: active ? colors.accent.salmon : colors.text.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease' }}>
                        {day.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Prioridad */}
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 8 }}>Prioridad</label>
            <div className="flex gap-2">
              {[{ key: 'low', label: 'Baja' }, { key: 'medium', label: 'Media' }, { key: 'high', label: 'Urgente' }].map(option => {
                const active = priority === option.key;
                return (
                  <button key={option.key} onClick={() => setPriority(option.key as Task['priority'])} className="flex items-center justify-center gap-1.5"
                    style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${active ? colors.accent.carmine : colors.bg.divider}`, backgroundColor: active ? `${colors.accent.carmine}22` : 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: active ? colors.accent.salmon : colors.text.secondary, cursor: 'pointer', transition: 'all 120ms ease' }}>
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
                  <button key={tag.id} onClick={() => setSelectedTags(prev => sel ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                    style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${sel ? tag.color : colors.bg.divider}`, backgroundColor: sel ? `${tag.color}33` : 'transparent', fontSize: 11, fontWeight: 500, fontFamily: "'Inter', sans-serif", color: sel ? tag.color : colors.text.secondary, cursor: 'pointer', transition: 'all 120ms ease' }}>
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-8">
          <button onClick={onClose}
            style={{ flex: 1, height: 42, borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleAdd} disabled={!title.trim() || isSubmitting}
            style={{ flex: 1, height: 42, borderRadius: 999, border: 'none', backgroundColor: title.trim() && !isSubmitting ? colors.accent.wine : colors.bg.hover, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: title.trim() && !isSubmitting ? colors.text.primary : colors.text.disabled, cursor: title.trim() && !isSubmitting ? 'pointer' : 'not-allowed', transition: 'background-color 120ms ease' }}>
            {isSubmitting ? 'Creando...' : 'Agregar tarea'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
