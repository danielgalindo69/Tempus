import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from './AppContext';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  delta?: number;
  animate?: boolean;
  suffix?: string;
}

export function StatCard({ label, value, icon: Icon, delta, animate = true, suffix = '' }: StatCardProps) {
  const { colors } = useApp();
  const [displayed, setDisplayed] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayed(value);
      return;
    }
    const duration = 600;
    const steps = 30;
    const step = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(interval);
      } else {
        setDisplayed(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value, animate]);

  return (
    <div
      style={{
        backgroundColor: colors.bg.card,
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 160,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {label}
        </span>
        {Icon && (
          <Icon size={16} strokeWidth={1.5} style={{ color: colors.text.disabled }} />
        )}
      </div>

      <div className="flex items-end gap-2">
        <span
          style={{
            fontFamily: typeof value === 'string' && value.includes(':')
              ? "'JetBrains Mono', monospace"
              : "'Instrument Serif', serif",
            fontSize: 36,
            fontWeight: 400,
            color: colors.text.primary,
            lineHeight: 1.1,
          }}
        >
          {typeof value === 'number' ? displayed : value}
          {suffix && (
            <span style={{ fontSize: 16, color: colors.text.secondary, marginLeft: 2 }}>
              {suffix}
            </span>
          )}
        </span>

        {delta !== undefined && (
          <div
            className="flex items-center gap-0.5 mb-1.5"
            style={{ color: delta >= 0 ? '#3A7D5C' : '#C0392B' }}
          >
            {delta >= 0 ? (
              <TrendingUp size={12} strokeWidth={1.5} />
            ) : (
              <TrendingDown size={12} strokeWidth={1.5} />
            )}
            <span
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500 }}
            >
              {delta > 0 ? '+' : ''}{delta}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
