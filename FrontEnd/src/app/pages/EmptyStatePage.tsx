import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import { useApp } from '../components/timeflow/AppContext';

const TABS = ['Tablero vacío', 'Sin datos', 'Error 404', 'Error 500'];

function EmptyKanbanSVG({ colors }: { colors: any }) {
  return (
    <motion.svg
      width="200" height="160" viewBox="0 0 200 160" fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Three columns */}
      {[30, 90, 150].map((x, i) => (
        <g key={i}>
          <motion.rect
            x={x - 22} y={20} width={44} height={6} rx="3"
            stroke={colors.bg.divider} strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          />
          <motion.rect
            x={x - 22} y={34} width={44} height={28} rx="4"
            stroke={colors.bg.divider} strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          />
          <motion.rect
            x={x - 22} y={70} width={44} height={28} rx="4"
            stroke={colors.bg.divider} strokeWidth="1.5" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
          />
        </g>
      ))}
      {/* Wine accent dot */}
      <motion.circle
        cx="100" cy="120" r="4"
        fill={colors.accent.wine}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </motion.svg>
  );
}

function EmptyChartSVG({ colors }: { colors: any }) {
  return (
    <motion.svg
      width="200" height="160" viewBox="0 0 200 160" fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Axes */}
      <motion.line
        x1="40" y1="20" x2="40" y2="130"
        stroke={colors.bg.divider} strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.line
        x1="40" y1="130" x2="180" y2="130"
        stroke={colors.bg.divider} strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Dashed line that "doesn't arrive" */}
      <motion.line
        x1="40" y1="80" x2="140" y2="80"
        stroke={colors.accent.wine} strokeWidth="1.5"
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.circle
        cx="140" cy="80" r="3"
        fill={colors.bg.divider}
        stroke={colors.bg.divider} strokeWidth="1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.0, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </motion.svg>
  );
}

function SuccessCheckSVG({ colors }: { colors: any }) {
  return (
    <motion.svg
      width="80" height="80" viewBox="0 0 80 80" fill="none"
    >
      <motion.path
        d="M20 40 L34 54 L60 26"
        stroke="#3A7D5C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  );
}

export function EmptyStatePage() {
  const { colors, navigate } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const renderState = () => {
    switch (activeTab) {
      case 0:
        return (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
            style={{ gap: 16 }}
          >
            <EmptyKanbanSVG colors={colors} />
            <div>
              <h3
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                  color: colors.text.primary,
                  marginBottom: 8,
                }}
              >
                Tu tablero está vacío
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: colors.text.secondary,
                  maxWidth: 320,
                  lineHeight: 1.6,
                  margin: '0 auto 24px',
                }}
              >
                Agrega tu primera tarea y empieza a gestionar tu tiempo de forma efectiva.
              </p>
            </div>
            <button
              onClick={() => navigate('kanban')}
              style={{
                height: 40, padding: '0 24px', borderRadius: 999,
                backgroundColor: colors.accent.wine, border: 'none',
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                color: colors.text.primary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accent.carmine)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.wine)}
            >
              <Plus size={14} strokeWidth={2} />
              Crear primera tarea
            </button>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="nodata"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
            style={{ gap: 16 }}
          >
            <EmptyChartSVG colors={colors} />
            <div>
              <h3
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                  color: colors.text.primary,
                  marginBottom: 8,
                }}
              >
                Sin datos aún
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: colors.text.secondary,
                  maxWidth: 320,
                  lineHeight: 1.6,
                  margin: '0 auto 24px',
                }}
              >
                Cuando completes tus primeras tareas, aquí verás tu historial de productividad.
              </p>
            </div>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                height: 40, padding: '0 24px', borderRadius: 999,
                border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent',
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                color: colors.text.secondary, cursor: 'pointer',
              }}
            >
              Ir al dashboard
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="404"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
            style={{ gap: 8 }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 96,
                color: colors.bg.divider,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                display: 'block',
              }}
            >
              404
            </span>
            <h3
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 24,
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              Página no encontrada
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: colors.text.secondary,
                maxWidth: 300,
                lineHeight: 1.6,
                margin: '0 auto 24px',
              }}
            >
              La página que buscas no existe o fue movida.
            </p>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                height: 40, padding: '0 24px', borderRadius: 999,
                backgroundColor: colors.accent.wine, border: 'none',
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                color: colors.text.primary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Volver al inicio
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="500"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
            style={{ gap: 8 }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 96,
                color: colors.bg.divider,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                display: 'block',
              }}
            >
              500
            </span>
            <h3
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 24,
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              Error del servidor
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: colors.text.secondary,
                maxWidth: 300,
                lineHeight: 1.6,
                margin: '0 auto 24px',
              }}
            >
              Algo salió mal. Nuestro equipo fue notificado. Por favor intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                height: 40, padding: '0 24px', borderRadius: 999,
                border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent',
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                color: colors.text.secondary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Reintentar
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 28,
          color: colors.text.primary,
          marginBottom: 8,
        }}
      >
        Estados vacíos
      </h2>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: colors.text.secondary,
          marginBottom: 32,
        }}
      >
        Pantallas de estado para diferentes situaciones de la aplicación
      </p>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-12"
        style={{
          backgroundColor: colors.bg.panel,
          borderRadius: 10,
          padding: 4,
          border: `1px solid ${colors.bg.divider}`,
          width: 'fit-content',
        }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              height: 32, padding: '0 16px', borderRadius: 8,
              border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
              backgroundColor: i === activeTab ? colors.bg.card : 'transparent',
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              fontWeight: i === activeTab ? 500 : 400,
              color: i === activeTab ? colors.text.primary : colors.text.secondary,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* State display */}
      <div
        style={{
          backgroundColor: colors.bg.panel,
          borderRadius: 16,
          border: `1px solid ${colors.bg.divider}`,
          padding: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
        }}
      >
        {renderState()}
      </div>
    </div>
  );
}
