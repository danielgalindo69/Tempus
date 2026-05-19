import { useState } from 'react';
import { Check, Zap, BarChart2, Clock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';

const DARK = {
  page: '#0D0D0D',
  panel: '#161614',
  card: '#1C1C1A',
  hover: '#2A2A26',
  divider: '#333330',
  text: '#F5F0E8',
  muted: '#A09E98',
  wine: '#8B1A2F',
  carmine: '#A8263D',
};

const features = [
  { icon: Clock, text: 'Cronómetro inteligente por sesión de trabajo' },
  { icon: Zap, text: 'Tablero Kanban con estimaciones de tiempo' },
  { icon: BarChart2, text: 'Dashboard de productividad semanal' },
];

export function LandingPage() {
  const { navigate, setIsAuthenticated, setUserName } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsAuthenticated(true);
    if (email) setUserName(email.split('@')[0]);
    navigate('onboarding');
    setLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: DARK.page,
        overflow: 'hidden',
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: DARK.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grain texture overlay */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.03,
            pointerEvents: 'none',
          }}
        >
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-3 mb-16"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
            <line x1="12" y1="12" x2="12" y2="4" stroke={DARK.text} strokeWidth="2" />
            <line x1="12" y1="12" x2="19" y2="12" stroke={DARK.wine} strokeWidth="2" />
          </svg>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 24,
              color: DARK.text,
              letterSpacing: '-0.01em',
            }}
          >
            Time<span style={{ color: DARK.wine }}>Flow</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 48,
              lineHeight: 1.1,
              color: DARK.text,
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Tu tiempo,<br />controlado.
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: DARK.muted,
              maxWidth: 380,
              marginBottom: 40,
            }}
          >
            Gestiona tus tareas, mide el tiempo real de cada actividad
            y mejora tu productividad con datos precisos.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: `${DARK.wine}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: DARK.wine }} />
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: DARK.muted,
                  }}
                >
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          width: 440,
          backgroundColor: DARK.panel,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          borderLeft: `1px solid ${DARK.divider}`,
          flexShrink: 0,
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28,
              color: DARK.text,
              marginBottom: 6,
            }}
          >
            Bienvenido de vuelta
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: DARK.muted,
              marginBottom: 32,
            }}
          >
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: DARK.muted,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="tu@correo.com"
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor: DARK.hover,
                  border: `1px solid ${emailFocused ? DARK.carmine : DARK.divider}`,
                  borderRadius: 10,
                  padding: '0 14px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: DARK.text,
                  outline: 'none',
                  transition: 'border-color 120ms ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: DARK.muted,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: 40,
                    backgroundColor: DARK.hover,
                    border: `1px solid ${passFocused ? DARK.carmine : DARK.divider}`,
                    borderRadius: 10,
                    padding: '0 40px 0 14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: DARK.text,
                    outline: 'none',
                    transition: 'border-color 120ms ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: DARK.muted,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 40,
                backgroundColor: loading ? DARK.hover : DARK.wine,
                border: 'none',
                borderRadius: 999,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: DARK.text,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = DARK.carmine)}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = DARK.wine)}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" dur="0.8s" from="0 12 12" to="360 12 12" repeatCount="indefinite" />
                  </path>
                </svg>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, backgroundColor: DARK.divider }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: DARK.muted,
                }}
              >
                o continúa con
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: DARK.divider }} />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => { setIsAuthenticated(true); navigate('onboarding'); }}
              style={{
                width: '100%',
                height: 40,
                backgroundColor: 'transparent',
                border: `1px solid ${DARK.divider}`,
                borderRadius: 999,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: DARK.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'border-color 120ms ease, background-color 120ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = DARK.hover;
                e.currentTarget.style.borderColor = DARK.muted;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = DARK.divider;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0112 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A11.95 11.95 0 0012 0C7.39 0 3.36 2.7 1.28 6.65l3.99 3.11z" />
                <path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0112 19.1c-2.99 0-5.57-1.85-6.72-4.52l-3.99 3.11C3.36 21.3 7.39 24 12 24c3.24 0 6.18-1.17 8.41-3.1l-4.37-2.89z" />
                <path fill="#4A90D9" d="M20.41 20.9c2.34-2.16 3.8-5.36 3.8-8.9 0-.73-.07-1.44-.19-2.12H12v4.26h6.64a5.68 5.68 0 01-2.23 3.65l4 2.89-.0.22z" />
                <path fill="#FBBC05" d="M5.28 14.58A7.15 7.15 0 014.9 12c0-.9.16-1.77.44-2.58L1.28 6.32A11.93 11.93 0 000 12c0 1.93.46 3.75 1.27 5.36l3.99-2.78z" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: DARK.muted,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('onboarding')}
              style={{
                background: 'none',
                border: 'none',
                color: DARK.wine,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                padding: 0,
              }}
            >
              Regístrate
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
