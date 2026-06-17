import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import type { Task } from '../components/timeflow/types';

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function doesTaskOccurOnDate(task: Task, date: Date) {
  const dateKey = toDateKey(date);
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

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstGridDay = new Date(firstDay);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  firstGridDay.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);
    return date;
  });
}

export function CalendarPage() {
  const { tasks, colors, navigate } = useApp();
  const [monthDate, setMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [direction, setDirection] = useState(1);

  const days = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const todayKey = toDateKey(new Date());

  const rawMonthLabel = monthDate.toLocaleDateString('es-MX', { month: 'long' });
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);
  const yearLabel = monthDate.getFullYear();

  const moveMonth = (step: number) => {
    setDirection(step > 0 ? 1 : -1);
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + step, 1));
  };

  const goToday = () => {
    const today = new Date();
    setDirection(today >= monthDate ? 1 : -1);
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: `${colors.accent.carmine}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarDays size={20} strokeWidth={1.5} style={{ color: colors.accent.carmine }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: colors.text.primary, lineHeight: 1.1 }}>
              {monthLabel}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, fontWeight: 500, letterSpacing: '0.05em' }}>
              {yearLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => moveMonth(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${colors.bg.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronLeft size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
          <button
            onClick={goToday}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              border: `1px solid ${colors.bg.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: colors.text.secondary,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = colors.bg.hover;
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.text.secondary;
            }}
          >
            Hoy
          </button>
          <button
            onClick={() => moveMonth(1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${colors.bg.divider}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
        </div>
      </div>

      {/* Week days labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, borderBottom: `1px solid ${colors.bg.divider}`, paddingBottom: 8 }}>
        {WEEK_DAYS.map(day => (
          <div
            key={day}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid container with AnimatePresence */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(120px, 1fr)',
              gap: 8,
              height: '100%',
              width: '100%',
            }}
          >
            {days.map(date => {
              const dateKey = toDateKey(date);
              const dayTasks = tasks.filter(task => doesTaskOccurOnDate(task, date));
              const inCurrentMonth = date.getMonth() === monthDate.getMonth();
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => navigate('kanban')}
                  style={{
                    backgroundColor: colors.bg.panel,
                    borderRadius: 12,
                    border: `1.5px solid ${isToday ? colors.accent.carmine : colors.bg.divider}`,
                    boxShadow: isToday ? `0 0 12px ${colors.accent.carmine}22` : 'none',
                    padding: 12,
                    opacity: inCurrentMonth ? 1 : 0.35,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = isToday ? colors.accent.carmine : colors.text.secondary;
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = isToday ? colors.accent.carmine : colors.bg.divider;
                    e.currentTarget.style.boxShadow = isToday ? `0 0 12px ${colors.accent.carmine}22` : 'none';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? colors.accent.salmon : colors.text.primary,
                      }}
                    >
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span
                        style={{
                          backgroundColor: colors.bg.hover,
                          borderRadius: 999,
                          padding: '1px 6px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10,
                          fontWeight: 500,
                          color: colors.text.secondary,
                        }}
                      >
                        {dayTasks.length} {dayTasks.length === 1 ? 'tarea' : 'tareas'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, overflow: 'hidden', flex: 1 }}>
                    {dayTasks.slice(0, 3).map(task => {
                      const firstTag = task.tags[0];

                      return (
                        <div
                          key={task.id}
                          style={{
                            borderLeft: `3px solid ${firstTag?.color ?? colors.accent.wine}`,
                            backgroundColor: colors.bg.card,
                            borderRadius: 8,
                            padding: '6px 8px',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            width: '100%',
                            boxSizing: 'border-box',
                            transition: 'all 120ms ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = colors.bg.hover;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = colors.bg.card;
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11,
                              fontWeight: 500,
                              color: colors.text.primary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.title}
                          </span>
                          {firstTag && (
                            <span
                              style={{
                                display: 'block',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 9,
                                color: firstTag.color,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {firstTag.name}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled, paddingLeft: 4 }}>
                        +{dayTasks.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
