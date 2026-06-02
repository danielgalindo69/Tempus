import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0];
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
  const monthLabel = monthDate.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} strokeWidth={1.5} style={{ color: colors.accent.carmine }} />
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: colors.text.primary, textTransform: 'capitalize' }}>
              {monthLabel}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>
              {monthDate.getFullYear()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => moveMonth(-1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
          <button
            onClick={goToday}
            style={{ height: 34, padding: '0 14px', borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}
          >
            Hoy
          </button>
          <button
            onClick={() => moveMonth(1)}
            style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {WEEK_DAYS.map(day => (
          <div key={day} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: colors.text.secondary, padding: '0 10px' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(116px, 1fr)', gap: 8, height: '100%' }}
          >
            {days.map(date => {
              const dateKey = toDateKey(date);
              const dayTasks = tasks.filter(task => task.date === dateKey);
              const inCurrentMonth = date.getMonth() === monthDate.getMonth();
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  style={{
                    backgroundColor: colors.bg.panel,
                    borderRadius: 10,
                    border: `1px solid ${isToday ? colors.accent.carmine : colors.bg.divider}`,
                    padding: 10,
                    opacity: inCurrentMonth ? 1 : 0.45,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: isToday ? colors.accent.salmon : colors.text.secondary }}>
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.text.disabled }}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, overflow: 'hidden' }}>
                    {dayTasks.slice(0, 3).map(task => {
                      const firstTag = task.tags[0];

                      return (
                        <button
                          key={task.id}
                          onClick={() => navigate('kanban')}
                          style={{
                            border: 'none',
                            borderLeft: `3px solid ${firstTag?.color ?? colors.accent.wine}`,
                            backgroundColor: colors.bg.card,
                            borderRadius: 7,
                            padding: '6px 8px',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                          </span>
                          {firstTag && (
                            <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: 10, color: firstTag.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {firstTag.name}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>
                        +{dayTasks.length - 3} mas
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
