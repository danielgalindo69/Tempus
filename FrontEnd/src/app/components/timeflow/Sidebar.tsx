import { useState } from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Calendar,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { Logo } from './Logo';
import type { Page } from './types';

const navItems: { label: string; icon: React.ElementType; page: Page }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Tablero', icon: KanbanSquare, page: 'kanban' },
  { label: 'Calendario', icon: Calendar, page: 'calendar' },
  { label: 'Semana', icon: CalendarDays, page: 'weekly' },
  { label: 'Análisis', icon: BarChart2, page: 'analytics' },
  { label: 'Urgentes', icon: AlertTriangle, page: 'urgent' },
];

export function Sidebar() {
  const { navigate, currentPage, colors, sidebarCollapsed, setSidebarCollapsed, userName } = useApp();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        backgroundColor: colors.bg.panel,
        borderRight: `1px solid ${colors.bg.divider}`,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 h-16"
        style={{ borderBottom: `1px solid ${colors.bg.divider}` }}
      >
        <Logo collapsed={sidebarCollapsed} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ label, icon: Icon, page }) => {
          const isActive = currentPage === page;
          return (
            <div key={page} className="relative">
              <button
                onClick={() => navigate(page)}
                onMouseEnter={() => setHoveredItem(label)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: sidebarCollapsed ? '0 11px' : '0 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive
                    ? `${colors.accent.wine}26`
                    : hoveredItem === label
                    ? colors.bg.hover
                    : 'transparent',
                  borderLeft: isActive ? `2px solid ${colors.accent.wine}` : '2px solid transparent',
                  transition: 'all 120ms ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  style={{ color: isActive ? colors.text.primary : colors.text.secondary, flexShrink: 0 }}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? colors.text.primary : colors.text.secondary,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Tooltip when collapsed */}
              {sidebarCollapsed && hoveredItem === label && (
                <div
                  style={{
                    position: 'absolute',
                    left: 72,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.bg.divider}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    color: colors.text.primary,
                    whiteSpace: 'nowrap',
                    zIndex: 50,
                    pointerEvents: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          );
        })}

        <div
          style={{ height: 1, backgroundColor: colors.bg.divider, margin: '8px 4px' }}
        />

        <div className="relative">
          <button
            onClick={() => navigate('empty')}
            onMouseEnter={() => setHoveredItem('estados')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              width: '100%',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? '0 11px' : '0 12px',
              borderRadius: 8,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentPage === 'empty'
                ? `${colors.accent.wine}26`
                : hoveredItem === 'estados'
                ? colors.bg.hover
                : 'transparent',
              borderLeft: currentPage === 'empty'
                ? `2px solid ${colors.accent.wine}`
                : '2px solid transparent',
              transition: 'all 120ms ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <Layers size={18} strokeWidth={1.5} style={{ color: colors.text.secondary, flexShrink: 0 }} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: colors.text.secondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Estados vacíos
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Bottom section */}
      <div
        style={{ borderTop: `1px solid ${colors.bg.divider}`, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => navigate('settings')}
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              width: '100%',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? '0 11px' : '0 12px',
              borderRadius: 8,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentPage === 'settings'
                ? `${colors.accent.wine}26`
                : hoveredItem === 'settings'
                ? colors.bg.hover
                : 'transparent',
              borderLeft: currentPage === 'settings'
                ? `2px solid ${colors.accent.wine}`
                : '2px solid transparent',
              transition: 'all 120ms ease',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <Settings size={18} strokeWidth={1.5} style={{ color: colors.text.secondary, flexShrink: 0 }} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, whiteSpace: 'nowrap' }}
                >
                  Configuración
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* User */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: sidebarCollapsed ? '8px 11px' : '8px 12px',
            borderRadius: 8,
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: colors.accent.wine,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 500,
              color: colors.text.primary,
              flexShrink: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex-1 min-w-0"
              >
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: colors.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userName}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            width: '100%',
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            cursor: 'pointer',
            border: `1px solid ${colors.bg.divider}`,
            backgroundColor: 'transparent',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          ) : (
            <ChevronLeft size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
