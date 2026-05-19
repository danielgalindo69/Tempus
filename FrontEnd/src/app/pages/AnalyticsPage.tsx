import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { StatCard } from '../components/timeflow/StatCard';
import { weeklyData, completionTrend, timeByTag, hourlyActivity } from '../components/timeflow/mockData';
import { Calendar, Clock, Target, Award } from 'lucide-react';

const RANGES = ['Esta semana', 'Este mes', 'Personalizado'];

function Heatmap() {
  const { colors } = useApp();
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
          {hourlyActivity.map((dayData, dayIdx) => (
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

  const totalHours = weeklyData.reduce((s, d) => s + d.hours, 0);
  const completionRate = Math.round(
    (tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100
  );
  const topTask = tasks.reduce((best, t) => t.actualTime > best.actualTime ? t : best, tasks[0]);

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
      {/* Range selector */}
      <div className="flex items-center gap-2 mb-8">
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total horas trabajadas', value: parseFloat(totalHours.toFixed(1)), icon: Clock, suffix: 'h', delta: 8 },
          { label: 'Tasa de completitud', value: completionRate, icon: Target, suffix: '%', delta: 5 },
          { label: 'Mejor día', value: 'Jueves', icon: Award, animate: false },
          { label: 'Racha actual', value: 7, icon: Calendar, suffix: ' días', delta: 16 },
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
            <BarChart data={weeklyData} barSize={28}>
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
            <LineChart data={completionTrend}>
              <XAxis dataKey="week" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: colors.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fill: colors.text.disabled, fontWeight: 300 }} axisLine={false} tickLine={false} width={28} />
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
                  data={timeByTag}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {timeByTag.map((entry, index) => (
                    <Cell key={index} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {timeByTag.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 300, color: colors.text.primary }}>
                    {Math.floor(item.value / 60)}h{item.value % 60 > 0 ? ` ${item.value % 60}m` : ''}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks
              .filter(t => t.actualTime > 0)
              .sort((a, b) => b.actualTime - a.actualTime)
              .slice(0, 5)
              .map((task, i) => (
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
                        width: `${Math.min(100, (task.actualTime / tasks[0].actualTime + 10) * 80)}%`,
                        backgroundColor: task.tags[0]?.color || colors.accent.wine,
                        borderRadius: 999, opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
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
        <Heatmap />
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
