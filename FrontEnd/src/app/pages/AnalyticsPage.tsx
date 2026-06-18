import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { StatCard } from '../components/timeflow/StatCard';
import { Calendar, Clock, Target, Award } from 'lucide-react';
import { getStreakInfo as fetchStreakInfo, type StreakInfo } from '../api/analytics';

const RANGES = ['Esta semana', 'Este mes', 'Personalizado'];

function Heatmap({ data, colors }: { data: number[][]; colors: any }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 8, minWidth: 600 }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 20 }}>
          {days.map(d => (
            <div
              key={d}
              style={{
                height: 16, width: 16, display: 'flex', alignItems: 'center',
                fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {/* Hour headers */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 0 }}>
            {hours.map(h => (
              <div
                key={h}
                style={{
                  width: 16, textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
                  color: colors.text.disabled, fontWeight: 300,
                  visibility: h % 3 === 0 ? 'visible' : 'hidden',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Cells */}
          {data.map((dayData, dayIdx) => (
            <div key={dayIdx} style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
              {dayData.map((value, hourIdx) => {
                const alpha = value;
                const r = parseInt(colors.accent.wine.slice(1, 3), 16);
                const g = parseInt(colors.accent.wine.slice(3, 5), 16);
                const b = parseInt(colors.accent.wine.slice(5, 7), 16);
                return (
                  <div
                    key={hourIdx}
                    title={`${days[dayIdx]} ${hourIdx}:00 — ${Math.round(value * 60)}min`}
                    style={{
                      width: 16, height: 16, borderRadius: 3,
                      backgroundColor: value === 0
                        ? colors.bg.hover
                        : `rgba(${r}, ${g}, ${b}, ${0.15 + alpha * 0.85})`,
                      cursor: 'default',
                      transition: 'background-color 150ms ease',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { colors, tasks } = useApp();
  const [range, setRange] = useState(0);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);

  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let cancelled = false;
    fetchStreakInfo()
      .then(info => {
        if (!cancelled) setStreakInfo(info);
      })
      .catch(err => console.error('Error fetching streak info:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Determine current from/to range
  let fromDate = '';
  let toDate = '';

  const now = new Date();
  if (range === 0) {
    // This week (Monday - Sunday)
    const day = now.getDay();
    const diffToMon = now.getDate() - (day === 0 ? 6 : day - 1);
    const mon = new Date(now.getFullYear(), now.getMonth(), diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    fromDate = mon.toISOString().split('T')[0];
    toDate = sun.toISOString().split('T')[0];
  } else if (range === 1) {
    // This month (1st to last day)
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fromDate = firstDay.toISOString().split('T')[0];
    toDate = lastDay.toISOString().split('T')[0];
  } else {
    fromDate = customFrom;
    toDate = customTo;
  }

  // Filter tasks & sessions
  const filteredTasks = tasks.filter(t => t.date >= fromDate && t.date <= toDate);
  const allSessionsFiltered = tasks.flatMap(t => t.sessions || []).filter(s => s.date >= fromDate && s.date <= toDate);

  // 1. Total hours
  const totalMinutes = allSessionsFiltered.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = totalMinutes / 60;

  // 2. Completion rate
  const completionRate = Math.round(
    (filteredTasks.filter(t => t.status === 'done').length / Math.max(filteredTasks.length, 1)) * 100
  );

  // Subtract days helper
  const subtractDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  // 3. Deltas (comparing to previous period of equal length)
  const daysDiff = Math.max(1, Math.round((new Date(toDate + 'T00:00:00').getTime() - new Date(fromDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const fromDatePrev = subtractDays(fromDate, daysDiff);
  const toDatePrev = subtractDays(toDate, daysDiff);

  const prevSessions = tasks.flatMap(t => t.sessions || []).filter(s => s.date >= fromDatePrev && s.date <= toDatePrev);
  const prevHours = prevSessions.reduce((sum, s) => sum + s.duration, 0) / 60;

  let hoursDelta = 0;
  if (prevHours > 0) {
    hoursDelta = Math.round(((totalHours - prevHours) / prevHours) * 100);
  } else if (totalHours > 0) {
    hoursDelta = 100;
  }

  const prevTasks = tasks.filter(t => t.date >= fromDatePrev && t.date <= toDatePrev);
  const prevDoneTasks = prevTasks.filter(t => t.status === 'done');
  const prevCompletionRate = prevTasks.length > 0 ? Math.round((prevDoneTasks.length / prevTasks.length) * 100) : 0;
  
  const completionDelta = completionRate - prevCompletionRate;

  // 4. Best day of week
  const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayMinutes = [0, 0, 0, 0, 0, 0, 0];
  allSessionsFiltered.forEach(s => {
    const d = new Date(s.date + 'T00:00:00');
    dayMinutes[d.getDay()] += s.duration;
  });
  let bestDayIdx = 1;
  let maxMinutes = -1;
  dayMinutes.forEach((mins, idx) => {
    if (mins > maxMinutes) {
      maxMinutes = mins;
      bestDayIdx = idx;
    }
  });
  const bestDay = maxMinutes > 0 ? DAYS_OF_WEEK[bestDayIdx] : 'Ninguno';

  // 5. Weekly Data Chart
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5]; // Sun=6, Mon=0 ... Sat=5
  const weeklyDataComputed = [
    { day: 'Lun', hours: 0, completed: 0 },
    { day: 'Mar', hours: 0, completed: 0 },
    { day: 'Mié', hours: 0, completed: 0 },
    { day: 'Jue', hours: 0, completed: 0 },
    { day: 'Vie', hours: 0, completed: 0 },
    { day: 'Sáb', hours: 0, completed: 0 },
    { day: 'Dom', hours: 0, completed: 0 },
  ];
  allSessionsFiltered.forEach(s => {
    const d = new Date(s.date + 'T00:00:00');
    weeklyDataComputed[dayIndexMap[d.getDay()]].hours += s.duration / 60;
  });
  filteredTasks.forEach(t => {
    if (t.status === 'done') {
      const d = new Date(t.date + 'T00:00:00');
      weeklyDataComputed[dayIndexMap[d.getDay()]].completed += 1;
    }
  });
  weeklyDataComputed.forEach(d => {
    d.hours = parseFloat(d.hours.toFixed(1));
  });

  // 6. Completion Trend Chart
  const datesInRange: string[] = [];
  const startD = new Date(fromDate + 'T00:00:00');
  const endD = new Date(toDate + 'T00:00:00');
  const tempD = new Date(startD);
  while (tempD <= endD) {
    datesInRange.push(tempD.toISOString().split('T')[0]);
    tempD.setDate(tempD.getDate() + 1);
  }

  let trendData: { name: string; rate: number }[] = [];
  let lastRate = 100;
  if (datesInRange.length <= 14) {
    trendData = datesInRange.map(dateStr => {
      const dayTasks = tasks.filter(t => t.date === dateStr);
      if (dayTasks.length > 0) {
        const doneTasks = dayTasks.filter(t => t.status === 'done');
        lastRate = Math.round((doneTasks.length / dayTasks.length) * 100);
      }
      const d = new Date(dateStr + 'T00:00:00');
      const label = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      return { name: label, rate: lastRate };
    });
  } else {
    const numWeeks = Math.ceil(datesInRange.length / 7);
    for (let i = 0; i < numWeeks; i++) {
      const weekDates = datesInRange.slice(i * 7, (i + 1) * 7);
      const weekTasks = tasks.filter(t => weekDates.includes(t.date));
      if (weekTasks.length > 0) {
        const doneTasks = weekTasks.filter(t => t.status === 'done');
        lastRate = Math.round((doneTasks.length / weekTasks.length) * 100);
      }
      trendData.push({
        name: `Sem ${i + 1}`,
        rate: lastRate
      });
    }
  }

  // 7. Time by Tag Chart
  const tagDurations: Record<string, { minutes: number; color: string }> = {};
  allSessionsFiltered.forEach(s => {
    const task = tasks.find(t => t.id === s.taskId);
    if (!task) return;
    const taskTags = task.tags || [];
    if (taskTags.length === 0) {
      if (!tagDurations['Sin categoría']) {
        tagDurations['Sin categoría'] = { minutes: 0, color: '#A09E98' };
      }
      tagDurations['Sin categoría'].minutes += s.duration;
    } else {
      const firstTag = taskTags[0];
      if (!tagDurations[firstTag.name]) {
        tagDurations[firstTag.name] = { minutes: 0, color: firstTag.color };
      }
      tagDurations[firstTag.name].minutes += s.duration;
    }
  });

  const timeByTagComputed = Object.entries(tagDurations).map(([name, info]) => ({
    name,
    value: info.minutes,
    color: info.color
  })).sort((a, b) => b.value - a.value);

  const timeByTagData = timeByTagComputed.length > 0 ? timeByTagComputed : [
    { name: 'Sin actividad', value: 1, color: '#222222' }
  ];

  // 8. Hourly Activity Heatmap
  const hourlyMatrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  allSessionsFiltered.forEach(s => {
    if (!s.startedAt) return;
    const dateObj = new Date(s.startedAt);
    const rawDay = dateObj.getDay();
    const dayIdx = dayIndexMap[rawDay];
    const hourIdx = dateObj.getHours();
    hourlyMatrix[dayIdx][hourIdx] += s.duration;
  });

  let maxMinutesInSlot = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (hourlyMatrix[d][h] > maxMinutesInSlot) {
        maxMinutesInSlot = hourlyMatrix[d][h];
      }
    }
  }

  const hourlyActivityComputed = hourlyMatrix.map(dayRow =>
    dayRow.map(mins => {
      if (mins === 0) return 0;
      if (maxMinutesInSlot === 0) return 0;
      return mins / maxMinutesInSlot;
    })
  );

  const tooltipStyle = {
    backgroundColor: colors.bg.card,
    border: `1px solid ${colors.bg.divider}`,
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: colors.text.primary,
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle}>
        <p style={{ color: colors.text.secondary, marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, fontSize: 14 }}>
          {payload[0].value}{typeof payload[0].value === 'number' && payload[0].name === 'rate' ? '%' : 'h'}
        </p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* Range selector & custom input */}
      <div className="flex items-center gap-3 flex-wrap mb-8">
        <div className="flex items-center gap-2">
          {RANGES.map((r, i) => (
            <button
              key={r}
              onClick={() => setRange(i)}
              style={{
                height: 32, padding: '0 16px', borderRadius: 999,
                border: `1px solid ${i === range ? colors.accent.wine : colors.bg.divider}`,
                backgroundColor: i === range ? `${colors.accent.wine}22` : 'transparent',
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: i === range ? 500 : 400,
                color: i === range ? colors.text.primary : colors.text.secondary,
                cursor: 'pointer', transition: 'all 120ms ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {range === 2 && (
          <div className="flex items-center gap-2" style={{
            padding: '4px 12px',
            borderRadius: 8,
            border: `1px solid ${colors.bg.divider}`,
            backgroundColor: `${colors.bg.panel}50`,
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>Desde:</span>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.text.primary,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                outline: 'none',
              }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>Hasta:</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.text.primary,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total horas trabajadas', value: parseFloat(totalHours.toFixed(1)), icon: Clock, suffix: 'h', delta: hoursDelta },
          { label: 'Tasa de completitud', value: completionRate, icon: Target, suffix: '%', delta: completionDelta },
          { label: 'Mejor día', value: bestDay, icon: Award, animate: false },
          { label: 'Racha actual', value: streakInfo ? streakInfo.currentStreak : 0, icon: Calendar, suffix: ' días', animate: false },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value as any}
              icon={stat.icon}
              delta={stat.delta}
              suffix={stat.suffix}
              animate={stat.animate !== false}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div
          style={{
            backgroundColor: colors.bg.panel, borderRadius: 12,
            border: `1px solid ${colors.bg.divider}`, padding: 24,
          }}
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 20 }}>
            Horas por día de la semana
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyDataComputed} barSize={28}>
              <XAxis dataKey="day" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: colors.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fill: colors.text.disabled, fontWeight: 300 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.bg.hover}80` }} />
              <Bar dataKey="hours" fill={colors.accent.wine} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div
          style={{
            backgroundColor: colors.bg.panel, borderRadius: 12,
            border: `1px solid ${colors.bg.divider}`, padding: 24,
          }}
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 20 }}>
            Tasa de completitud (%)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="name" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: colors.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fill: colors.text.disabled, fontWeight: 300 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={tooltipStyle}>
                      <p style={{ color: colors.text.secondary, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, fontSize: 14 }}>{payload[0].value}%</p>
                    </div>
                  );
                }}
                cursor={{ stroke: colors.bg.divider }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={colors.accent.terra}
                strokeWidth={2}
                dot={{ fill: colors.accent.terra, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: colors.accent.terra }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut chart */}
        <div
          style={{
            backgroundColor: colors.bg.panel, borderRadius: 12,
            border: `1px solid ${colors.bg.divider}`, padding: 24,
          }}
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 20 }}>
            Tiempo por categoría
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={timeByTagData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {timeByTagData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }} className="tf-scrollbar">
              {timeByTagData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }} title={item.name}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 300, color: colors.text.primary }}>
                    {item.value >= 60 ? `${Math.floor(item.value / 60)}h${item.value % 60 > 0 ? ` ${item.value % 60}m` : ''}` : `${item.value}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top tasks */}
        <div
          style={{
            backgroundColor: colors.bg.panel, borderRadius: 12,
            border: `1px solid ${colors.bg.divider}`, padding: 24,
          }}
        >
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 20 }}>
            Top tareas por tiempo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 160, overflowY: 'auto' }} className="tf-scrollbar">
            {tasks
              .filter(t => t.actualTime > 0)
              .sort((a, b) => b.actualTime - a.actualTime)
              .slice(0, 5)
              .map((task, i) => {
                const maxActualTime = Math.max(...tasks.map(t => t.actualTime), 1);
                return (
                  <div key={task.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 300, color: colors.text.disabled }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.primary,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 300, color: colors.text.secondary }}>
                        {task.actualTime >= 60 ? `${Math.floor(task.actualTime / 60)}h ${task.actualTime % 60}m` : `${task.actualTime}min`}
                      </span>
                    </div>
                    <div style={{ height: 3, backgroundColor: colors.bg.hover, borderRadius: 999 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (task.actualTime / maxActualTime) * 100)}%`,
                          backgroundColor: task.tags[0]?.color || colors.accent.wine,
                          borderRadius: 999, opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            {tasks.filter(t => t.actualTime > 0).length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.disabled }}>
                Sin tareas con tiempo registrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div
        style={{
          backgroundColor: colors.bg.panel, borderRadius: 12,
          border: `1px solid ${colors.bg.divider}`, padding: 24,
        }}
      >
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 20 }}>
          Actividad por hora del día
        </h3>
        <Heatmap data={hourlyActivityComputed} colors={colors} />
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled }}>Menos</span>
          {[0, 0.25, 0.5, 0.75, 1].map(v => {
            const r = parseInt(colors.accent.wine.slice(1, 3), 16);
            const g = parseInt(colors.accent.wine.slice(3, 5), 16);
            const b = parseInt(colors.accent.wine.slice(5, 7), 16);
            return (
              <div
                key={v}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  backgroundColor: v === 0 ? colors.bg.hover : `rgba(${r}, ${g}, ${b}, ${0.15 + v * 0.85})`,
                }}
              />
            );
          })}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled }}>Más</span>
        </div>
      </div>
    </div>
  );
}
