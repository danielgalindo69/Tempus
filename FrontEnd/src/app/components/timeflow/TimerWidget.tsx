import { useState } from 'react';
import { Play, Pause, Square, Timer, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function TimerWidget() {
  const { timerState, stopTimer, toggleTimerPause, tasks, colors } = useApp();
  const [expanded, setExpanded] = useState(false);

  const activeTask = tasks.find(t => t.id === timerState.activeTaskId);

  if (!timerState.isActive) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        backgroundColor: colors.bg.card,
        border: `1px solid ${colors.bg.divider}`,
        borderRadius: 16,
        boxShadow: `0 8px 32px ${colors === colors ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}`,
        zIndex: 100,
        overflow: 'hidden',
        width: expanded ? 280 : 220,
      }}
    >
      {/* Compact header */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        style={{ padding: expanded ? '16px 16px 12px' : '12px 16px' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Active indicator */}
        <div
          className="tf-dot-active"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: colors.accent.terra,
            flexShrink: 0,
          }}
        />

        {/* Time display */}
        <span
          className={timerState.isActive && !timerState.isPaused ? 'tf-timer-active' : ''}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 20,
            fontWeight: 300,
            color: colors.text.primary,
            letterSpacing: '0.02em',
            flex: 1,
          }}
        >
          {formatTime(timerState.seconds)}
        </span>

        {expanded ? (
          <ChevronDown size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
        ) : (
          <ChevronUp size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, backgroundColor: colors.bg.hover }}>
        <motion.div
          style={{
            height: '100%',
            backgroundColor: colors.accent.terra,
            width: activeTask
              ? `${Math.min(100, (timerState.seconds / 60 / activeTask.estimatedTime) * 100)}%`
              : '0%',
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px' }}>
              {/* Task name */}
              {activeTask && (
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: colors.accent.terra,
                    marginBottom: 16,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeTask.title}
                </p>
              )}

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={toggleTimerPause}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: colors.accent.wine,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 120ms ease, transform 120ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = colors.accent.carmine;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = colors.accent.wine;
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = 'scale(0.92)';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {timerState.isPaused ? (
                    <Play size={18} strokeWidth={1.5} fill={colors.text.primary} style={{ color: colors.text.primary }} />
                  ) : (
                    <Pause size={18} strokeWidth={1.5} style={{ color: colors.text.primary }} />
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopTimer}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.text.secondary}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 120ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = colors.text.primary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = colors.text.secondary;
                  }}
                >
                  <Square size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>
                    Estimado
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 300, color: colors.text.secondary }}>
                    {activeTask ? `${activeTask.estimatedTime}min` : '--'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
