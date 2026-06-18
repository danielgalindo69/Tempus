import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  TrendingUp,
  Flame,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { StatCard } from '../components/timeflow/StatCard';
import { TaskCard } from '../components/timeflow/TaskCard';
import { getStreakInfo as fetchStreakInfo, type StreakInfo } from '../api/analytics';

export function DashboardPage() {
  const { tasks, colors, navigate } = useApp();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);

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

  const completedToday = tasks.filter(t => t.status === 'done').length;
  const totalWorked = tasks.reduce((sum, t) => sum + t.actualTime, 0);
  const totalHours = Math.floor(totalWorked / 60);
  const totalMin = totalWorked % 60;
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);
  const ratio = totalEstimated > 0 ? Math.round((totalWorked / totalEstimated) * 100) : 0;

  const plannedTasks = tasks.filter(t => t.status === 'planned').slice(0, 3);
  const progressTasks = tasks.filter(t => t.status === 'progress').slice(0, 3);
  const doneTasks = tasks.filter(t => t.status === 'done').slice(0, 3);

  const recentSessions = tasks
    .flatMap(t => t.sessions.map(s => ({ ...s, taskTitle: t.title })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Compute weekly chart data dynamically for current week
  const getWeekDates = () => {
    const dates = [];
    const now = new Date();
    const day = now.getDay();
    const diffToMon = now.getDate() - (day === 0 ? 6 : day - 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), diffToMon + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5]; // Sun=6, Mon=0 ... Sat=5

  const weeklyDataComputed = [
    { day: 'Lun', hours: 0 },
    { day: 'Mar', hours: 0 },
    { day: 'Mié', hours: 0 },
    { day: 'Jue', hours: 0 },
    { day: 'Vie', hours: 0 },
    { day: 'Sáb', hours: 0 },
    { day: 'Dom', hours: 0 },
  ];

  const allSessionsThisWeek = tasks
    .flatMap(t => t.sessions || [])
    .filter(s => weekDates.includes(s.date));

  allSessionsThisWeek.forEach(s => {
    const d = new Date(s.date + 'T00:00:00');
    const idx = dayIndexMap[d.getDay()];
    weeklyDataComputed[idx].hours += s.duration / 60;
  });

  weeklyDataComputed.forEach(d => {
    d.hours = parseFloat(d.hours.toFixed(1));
  });

  const totalWeekHours = weeklyDataComputed.reduce((s, d) => s + d.hours, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: colors.bg.card,
            border: `1px solid ${colors.bg.divider}`,
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, marginBottom: 2 }}>{label}</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 300, color: colors.text.primary }}>
            {payload[0].value}h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="tf-responsive-stats-grid"
        style={{ marginBottom: 32 }}
      >
        {[
          { label: 'Tareas completadas hoy', value: completedToday, icon: CheckSquare, delta: 12 },
          { label: 'Tiempo trabajado hoy', value: `${totalHours}:${String(totalMin).padStart(2, '0')}`, icon: Clock, animate: false },
          { label: 'Real vs estimado', value: ratio, icon: TrendingUp, suffix: '%', delta: -3 },
          { label: 'Racha activa', value: streakInfo ? streakInfo.currentStreak : 0, icon: Flame, suffix: ' días' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value as any}
              icon={stat.icon}
              delta={(stat as any).delta}
              suffix={stat.suffix}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="tf-responsive-dashboard-grid" style={{ marginBottom: 24 }}>
        {/* Mini Kanban */}
        <div
          style={{
            backgroundColor: colors.bg.panel,
            borderRadius: 12,
            border: `1px solid ${colors.bg.divider}`,
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.bg.divider}` }}
          >
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: colors.text.primary,
              }}
            >
              Tablero
            </h2>
            <button
              onClick={() => navigate('kanban')}
              className="flex items-center gap-1"
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: colors.text.secondary,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Ver todo <ArrowRight size={12} strokeWidth={1.5} />
            </button>
          </div>

          <div
            className="tf-responsive-mini-kanban-grid"
            style={{
              gap: 0,
            }}
          >
            {[
              { label: 'Planeado', color: '#3B5A8A', tasks: plannedTasks },
              { label: 'En proceso', color: '#C4914A', tasks: progressTasks },
              { label: 'Terminado', color: '#3A7D5C', tasks: doneTasks },
            ].map(({ label, color, tasks: colTasks }, colIdx) => (
              <div
                key={label}
                className="border-b last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
                style={{
                  borderColor: colors.bg.divider,
                  padding: 16,
                  minHeight: 200,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: colors.text.secondary }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: colors.text.disabled,
                      marginLeft: 'auto',
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} compact onClick={() => navigate('kanban')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent sessions */}
          <div
            style={{
              backgroundColor: colors.bg.panel,
              borderRadius: 12,
              border: `1px solid ${colors.bg.divider}`,
              overflow: 'hidden',
              flex: 1,
            }}
          >
            <div
              style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.bg.divider}` }}
            >
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: colors.text.primary }}>
                Sesiones recientes
              </h2>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentSessions.length === 0 ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.disabled, padding: '16px 20px' }}>
                  Sin sesiones registradas
                </p>
              ) : (
                recentSessions.map((session, i) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3"
                    style={{
                      padding: '10px 20px',
                      borderBottom: i < recentSessions.length - 1 ? `1px solid ${colors.bg.divider}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: `${colors.accent.wine}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Clock size={13} strokeWidth={1.5} style={{ color: colors.accent.wine }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          fontWeight: 500,
                          color: colors.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {session.taskTitle}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>
                        {session.date}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        fontWeight: 300,
                        color: colors.text.secondary,
                        flexShrink: 0,
                      }}
                    >
                      {session.duration >= 60
                        ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}min`
                        : `${session.duration}min`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div
        style={{
          backgroundColor: colors.bg.panel,
          borderRadius: 12,
          border: `1px solid ${colors.bg.divider}`,
          padding: 24,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: colors.text.primary }}>
            Horas por día esta semana
          </h2>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 300, color: colors.text.secondary }}>
            {totalWeekHours.toFixed(1)}h total
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyDataComputed} barSize={28}>
            <XAxis
              dataKey="day"
              tick={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fill: colors.text.secondary }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fill: colors.text.disabled, fontWeight: 300 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.bg.hover}80` }} />
            <Bar
              dataKey="hours"
              fill={colors.accent.wine}
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
