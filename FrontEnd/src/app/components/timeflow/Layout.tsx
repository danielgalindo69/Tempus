import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Bell, Plus, Check, CheckCheck, Clock, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { Sidebar } from './Sidebar';
import { TimerWidget } from './TimerWidget';
import { AddTaskModal } from './AddTaskModal';
import type { BackendNotification } from '../../api/notifications';

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

function NotificationItem({ notification, colors }: { notification: BackendNotification; colors: any }) {
  const isUnread = !notification.isRead;
  const typeIcons: Record<string, ReactNode> = {
    task_start: <Zap size={13} style={{ color: colors.accent.terra }} />,
    task_reminder: <Clock size={13} style={{ color: colors.state?.progress || colors.accent.terra }} />,
    task_end: <Check size={13} style={{ color: colors.state?.done || '#3A7D5C' }} />,
    system: <Bell size={13} style={{ color: colors.text.secondary }} />,
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `hace ${days}d`;
    if (hrs > 0) return `hace ${hrs}h`;
    if (mins > 0) return `hace ${mins}m`;
    return 'ahora';
  };

  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      backgroundColor: isUnread ? `${colors.accent.wine}10` : 'transparent',
      border: `1px solid ${isUnread ? colors.accent.wine + '30' : colors.bg.divider}`,
      transition: 'all 150ms ease',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, backgroundColor: colors.bg.hover,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
        }}>
          {typeIcons[notification.type] || typeIcons.system}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: isUnread ? 500 : 400, color: colors.text.primary, lineHeight: 1.4, marginBottom: 2 }}>
            {notification.title}
          </p>
          {notification.body && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.secondary, lineHeight: 1.4, marginBottom: 4 }}>
              {notification.body}
            </p>
          )}
          {notification.task && (
            <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 4, backgroundColor: colors.bg.hover, fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled }}>
              📋 {notification.task.title}
            </span>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled, marginTop: 4 }}>
            {timeAgo(notification.createdAt)}
          </p>
        </div>
        {isUnread && (
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: colors.accent.carmine, flexShrink: 0, marginTop: 6 }} />
        )}
      </div>
    </div>
  );
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { colors, notifications, unreadCount, markAllNotificationsRead, isAuthenticated } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', top: 48, right: 0, width: 360,
        backgroundColor: colors.bg.panel,
        border: `1px solid ${colors.bg.divider}`,
        borderRadius: 16, zIndex: 100,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.bg.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={15} strokeWidth={1.5} style={{ color: colors.text.primary }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary }}>
            Notificaciones
          </span>
          {unreadCount > 0 && (
            <span style={{ backgroundColor: colors.accent.wine, color: colors.text.primary, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', items: 'center', gap: 6 }}>
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.secondary, transition: 'all 120ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <CheckCheck size={12} />
              Marcar leídas
            </button>
          )}
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bg.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <X size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: 380, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }} className="tf-scrollbar">
        {!isAuthenticated ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Bell size={32} strokeWidth={1} style={{ color: colors.text.disabled, margin: '0 auto 10px' }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary, lineHeight: 1.5 }}>
              Inicia sesión para ver tus notificaciones
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: colors.bg.hover, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Bell size={22} strokeWidth={1} style={{ color: colors.text.disabled }} />
            </div>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: colors.text.primary, marginBottom: 6 }}>
              Todo al día
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>
              No tienes notificaciones pendientes
            </p>
          </div>
        ) : (
          notifications.map(n => <NotificationItem key={n.id} notification={n} colors={colors} />)
        )}
      </div>
    </motion.div>
  );
}

interface LayoutProps {
  children: ReactNode;
  onNewTask?: () => void;
}

export function Layout({ children }: LayoutProps) {
  const {
    colors, currentPage, userName,
    isGlobalAddTaskOpen, openGlobalAddTask, closeGlobalAddTask,
    isNotificationPanelOpen, openNotificationPanel, closeNotificationPanel,
    unreadCount,
  } = useApp();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const showGreeting = currentPage === 'dashboard';

  return (
    <div className="flex" style={{ height: '100vh', backgroundColor: colors.bg.page }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header style={{
          height: 64, backgroundColor: colors.bg.page,
          borderBottom: `1px solid ${colors.bg.divider}`,
          display: 'flex', alignItems: 'center', padding: '0 32px',
          flexShrink: 0, gap: 16,
        }}>
          <div className="flex-1">
            {showGreeting ? (
              <div>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: colors.text.primary, lineHeight: 1.2 }}>
                  {greeting}, {userName}
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary, textTransform: 'capitalize' }}>
                  {dateStr}
                </p>
              </div>
            ) : (
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: colors.text.primary, lineHeight: 1.2 }}>
                {PAGE_TITLES[currentPage] || ''}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Botón Notificaciones */}
            <div style={{ position: 'relative' }}>
              <button
                id="notification-bell-btn"
                onClick={isNotificationPanelOpen ? closeNotificationPanel : openNotificationPanel}
                style={{
                  width: 36, height: 36, borderRadius: 8, backgroundColor: isNotificationPanelOpen ? `${colors.accent.wine}22` : 'transparent',
                  border: `1px solid ${isNotificationPanelOpen ? colors.accent.wine : colors.bg.divider}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!isNotificationPanelOpen) e.currentTarget.style.backgroundColor = colors.bg.hover; }}
                onMouseLeave={e => { if (!isNotificationPanelOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Bell size={16} strokeWidth={1.5} style={{ color: isNotificationPanelOpen ? colors.accent.salmon : colors.text.secondary }} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 16, height: 16, borderRadius: '50%',
                      backgroundColor: colors.accent.carmine, color: colors.text.primary,
                      fontSize: 9, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${colors.bg.page}`,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationPanelOpen && (
                  <NotificationPanel onClose={closeNotificationPanel} />
                )}
              </AnimatePresence>
            </div>

            {/* Botón Nueva tarea */}
            <button
              id="global-add-task-btn"
              onClick={openGlobalAddTask}
              style={{
                height: 36, padding: '0 16px', borderRadius: 999,
                backgroundColor: colors.accent.wine, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background-color 120ms ease',
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                color: colors.text.primary,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accent.carmine)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.wine)}
            >
              <Plus size={14} strokeWidth={2} />
              Nueva tarea
            </button>
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

      {/* Modal global de nueva tarea */}
      <AnimatePresence>
        {isGlobalAddTaskOpen && (
          <AddTaskModal column="planned" onClose={closeGlobalAddTask} />
        )}
      </AnimatePresence>
    </div>
  );
}
