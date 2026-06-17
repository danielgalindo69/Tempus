import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { TaskCard } from '../components/timeflow/TaskCard';
import type { Task } from '../components/timeflow/types';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

function isToday(d: Date) {
  return formatDate(d) === formatDate(new Date());
}

export function WeeklyPage() {
  const { tasks, updateTask, colors } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const weekDates = getWeekDates(weekOffset);

  const getTasksForDay = (date: Date) =>
    tasks.filter(t => doesTaskOccurOnDate(t, date));

  const getDayLoad = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    const total = dayTasks.reduce((s, t) => s + t.estimatedTime, 0);
    return Math.min(1, total / 480);
  };

  const handleDrop = (date: Date) => {
    if (draggedId) {
      updateTask(draggedId, { date: formatDate(date) });
    }
    setDraggedId(null);
    setDragOverDay(null);
  };

  const weekLabel = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (weekOffset === 0) return 'Esta semana';
    if (weekOffset === 1) return 'Próxima semana';
    if (weekOffset === -1) return 'Semana pasada';
    return `${start.getDate()} – ${end.getDate()} ${end.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        className="flex items-center gap-4"
        style={{ marginBottom: 24 }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronLeft size={15} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, minWidth: 160, textAlign: 'center' }}>
            {weekLabel()}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronRight size={15} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
        </div>

        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            style={{
              height: 28, padding: '0 12px', borderRadius: 999,
              border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent',
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary,
              cursor: 'pointer',
            }}
          >
            Hoy
          </button>
        )}
      </div>

      {/* Days grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 12,
          flex: 1,
          overflowY: 'auto',
        }}
        className="tf-scrollbar"
      >
        {weekDates.map((date, i) => {
          const dayTasks = getTasksForDay(date);
          const load = getDayLoad(date);
          const today = isToday(date);
          const isDropTarget = dragOverDay === formatDate(date);
          const isWeekend = i >= 5;
          const hasNoTasks = dayTasks.length === 0;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              onDragOver={e => { e.preventDefault(); setDragOverDay(formatDate(date)); }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={() => handleDrop(date)}
              style={{
                backgroundColor: isDropTarget ? `${colors.bg.hover}66` : colors.bg.panel,
                borderRadius: 12,
                border: `1px ${isDropTarget ? 'dashed' : 'solid'} ${isDropTarget ? colors.accent.wine : colors.bg.divider}`,
                display: 'flex',
                flexDirection: 'column',
                opacity: isWeekend && hasNoTasks ? 0.5 : 1,
                transition: 'all 150ms ease',
                overflow: 'hidden',
                minHeight: 200,
              }}
            >
              {/* Day header */}
              <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${colors.bg.divider}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      color: today ? colors.accent.wine : colors.text.secondary,
                    }}
                  >
                    {DAYS[i]}
                  </span>
                  {today && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.accent.wine }} />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: today ? "'Instrument Serif', serif" : "'Inter', sans-serif",
                    fontSize: today ? 22 : 18,
                    color: today ? colors.text.primary : colors.text.secondary,
                    lineHeight: 1,
                  }}
                >
                  {date.getDate()}
                </span>

                {/* Workload bar */}
                {dayTasks.length > 0 && (
                  <div style={{ marginTop: 8, height: 3, backgroundColor: colors.bg.hover, borderRadius: 999 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${load * 100}%`,
                        backgroundColor: load > 0.8 ? '#C0392B' : load > 0.5 ? colors.accent.terra : colors.state.done,
                        borderRadius: 999,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                )}

                {dayTasks.length > 0 && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
                    {dayTasks.reduce((s, t) => s + t.estimatedTime, 0)}min estimados
                  </p>
                )}
              </div>

              {/* Tasks */}
              <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    draggable
                    compact
                    onDragStart={id => setDraggedId(id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverDay(null); }}
                    isDragging={draggedId === task.id}
                  />
                ))}

                {isDropTarget && draggedId && (
                  <div
                    style={{
                      height: 40, borderRadius: 8, border: `2px dashed ${colors.accent.wine}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: colors.accent.wine, fontSize: 12, fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Soltar aquí
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
