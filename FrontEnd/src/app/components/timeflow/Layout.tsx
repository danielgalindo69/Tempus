import { ReactNode } from 'react';
import { Bell, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { Sidebar } from './Sidebar';
import { TimerWidget } from './TimerWidget';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  kanban: 'Tablero',
  calendar: 'Calendario',
  weekly: 'Vista semanal',
  analytics: 'Análisis',
  settings: 'Configuración',
  empty: 'Estados & Errores',
  urgent: 'Tareas Urgentes',
  tags: 'Etiquetas',
};

interface LayoutProps {
  children: ReactNode;
  onNewTask?: () => void;
}

export function Layout({ children, onNewTask }: LayoutProps) {
  const { colors, currentPage, userName } = useApp();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const showGreeting = currentPage === 'dashboard';

  return (
    <div className="flex" style={{ height: '100vh', backgroundColor: colors.bg.page }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header
          style={{
            height: 64,
            backgroundColor: colors.bg.page,
            borderBottom: `1px solid ${colors.bg.divider}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            flexShrink: 0,
            gap: 16,
          }}
        >
          <div className="flex-1">
            {showGreeting ? (
              <div>
                <h1
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 22,
                    color: colors.text.primary,
                    lineHeight: 1.2,
                  }}
                >
                  {greeting}, {userName}
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: colors.text.secondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {dateStr}
                </p>
              </div>
            ) : (
              <h1
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 24,
                  color: colors.text.primary,
                  lineHeight: 1.2,
                }}
              >
                {PAGE_TITLES[currentPage] || ''}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.bg.divider}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bell size={16} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
            </button>

            {onNewTask && (
              <button
                onClick={onNewTask}
                style={{
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 999,
                  backgroundColor: colors.accent.wine,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background-color 120ms ease',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.text.primary,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accent.carmine)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.wine)}
              >
                <Plus size={14} strokeWidth={2} />
                Nueva tarea
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="flex-1 overflow-auto tf-scrollbar"
          style={{ padding: currentPage === 'kanban' ? 0 : 32 }}
        >
          {children}
        </motion.main>
      </div>

      <TimerWidget />
    </div>
  );
}
