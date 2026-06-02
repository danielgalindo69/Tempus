import { AlertTriangle, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { TaskCard } from '../components/timeflow/TaskCard';

export function UrgentPage() {
  const { tasks, colors, navigate } = useApp();

  const urgentTasks = tasks.filter(task => task.priority === 'high' && task.status !== 'done');

  return (
    <div style={{ maxWidth: 1120, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div
        className="flex items-center gap-3"
        style={{
          padding: '16px 0',
          borderBottom: `1px solid ${colors.bg.divider}`,
          marginBottom: 24,
        }}
      >
        <AlertTriangle size={24} style={{ color: colors.accent.carmine }} />
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: colors.text.primary }}>
          Tareas Urgentes
        </h1>
      </div>

      {urgentTasks.length === 0 ? (
        /* Estado vacío premium */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
            backgroundColor: colors.bg.panel,
            borderRadius: 16,
            border: `1px dashed ${colors.bg.divider}`,
            textAlign: 'center',
            marginTop: 12,
            minHeight: 400,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: `${colors.accent.wine}16`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <AlertTriangle size={24} style={{ color: colors.text.disabled }} />
          </div>
          <h3
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 22,
              color: colors.text.primary,
              marginBottom: 10,
            }}
          >
            Todo bajo control
          </h3>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: colors.text.secondary,
              maxWidth: 400,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            No tienes tareas marcadas como urgentes. Disfruta de la calma y planifica tu semana con tranquilidad.
          </p>
          <button
            onClick={() => navigate('kanban')}
            className="flex items-center gap-2 tf-btn-premium"
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 999,
              backgroundColor: colors.accent.wine,
              border: 'none',
              cursor: 'pointer',
              color: colors.text.primary,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accent.carmine)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.wine)}
          >
            <Plus size={14} strokeWidth={1.5} />
            Planificar Tarea
          </button>
        </motion.div>
      ) : (
        /* Listado de tareas urgentes con un toque carmesí */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}
        >
          {urgentTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.accent.carmine}50`, // Borde carmesí
                boxShadow: `0 4px 20px rgba(154,27,27,0.06)`,
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
              whileHover={{
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px rgba(154,27,27,0.12)`,
                borderColor: colors.accent.carmine,
              }}
            >
              <TaskCard
                task={task}
                onClick={() => navigate('kanban')}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
