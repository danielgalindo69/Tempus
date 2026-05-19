import { useApp } from './AppContext';

interface LogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ collapsed = false, size = 'md' }: LogoProps) {
  const { colors } = useApp();
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const fontSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="4"
          stroke={colors.text.primary}
          strokeWidth="2"
        />
        <line
          x1="12"
          y1="12"
          x2="18"
          y2="12"
          stroke={colors.accent.wine}
          strokeWidth="2"
        />
      </svg>
      {!collapsed && (
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          Time
          <span style={{ color: colors.accent.wine }}>Flow</span>
        </span>
      )}
    </div>
  );
}
