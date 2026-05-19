import { useState } from 'react';
import { GripVertical, MoreHorizontal, Clock, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import type { Task } from './types';

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  planned: '#3B5A8A',
  progress: '#C4914A',
  done: '#3A7D5C',
};

export function TaskCard({
  task,
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
  onClick,
  compact = false,
}: TaskCardProps) {
  const { colors, startTimer } = useApp();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        rotate: isDragging ? 2 : 0,
      }}
      transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
      draggable={draggable}
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        onDragStart?.(task.id);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={onClick}
      style={{
        backgroundColor: colors.bg.card,
        borderRadius: 10,
        borderLeft: `3px solid ${statusColors[task.status]}`,
        padding: compact ? '10px 12px' : '12px 14px',
        cursor: draggable ? 'grab' : 'pointer',
        transform: hovered && !isDragging ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 180ms ease-out, box-shadow 180ms ease-out',
        boxShadow: isDragging
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : hovered
          ? '0 4px 12px rgba(0,0,0,0.2)'
          : 'none',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {draggable && (
          <div
            style={{
              opacity: hovered ? 0.5 : 0,
              transition: 'opacity 120ms ease',
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            <GripVertical size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: task.status === 'done' ? colors.text.secondary : colors.text.primary,
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              lineHeight: 1.4,
              marginBottom: compact ? 6 : 8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.title}
          </p>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {task.tags.map(tag => (
                <span
                  key={tag.id}
                  style={{
                    backgroundColor: `${tag.color}33`,
                    color: tag.color,
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    padding: '2px 8px',
                    borderRadius: 6,
                    lineHeight: 1.6,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Time info */}
          {!compact && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock size={12} strokeWidth={1.5} style={{ color: colors.text.disabled }} />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 300,
                    color: colors.text.secondary,
                  }}
                >
                  {task.actualTime > 0
                    ? `${formatTime(task.actualTime)} / ${formatTime(task.estimatedTime)}`
                    : formatTime(task.estimatedTime)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms ease', flexShrink: 0 }}
        >
          {task.status !== 'done' && (
            <button
              onClick={e => {
                e.stopPropagation();
                startTimer(task.id);
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: 'none',
                backgroundColor: `${statusColors.progress}22`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={11} strokeWidth={1.5} style={{ color: statusColors.progress }} />
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreHorizontal size={14} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
