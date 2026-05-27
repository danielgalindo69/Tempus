import { useState, useEffect, useRef } from 'react';
import { Zap, BarChart2, Clock, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../components/timeflow/AppContext';
import logoImg from '../../assets/Gemini_Generated_Image_9lo4mg9lo4mg9lo4-removebg-preview.png';
const DARK = {
  page: '#121212',
  panel: '#242426',
  card: '#1A1A1C',
  hover: '#333336',
  divider: '#3A3A3A',
  text: '#F5F0E8',
  muted: '#A09E98',
  wine: '#9A1B1B',
  carmine: '#C42626',
};

const INSPIRATIONAL_QUOTES = [
  { text: "No es que tengamos poco tiempo, sino que perdemos mucho.", author: "Séneca" },
  { text: "Acuérdate de cuánto tiempo llevas posponiendo las cosas... Tu tiempo tiene un límite marcado; si no lo usas para limpiar tu mente, se irá y nunca volverá.", author: "Marco Aurelio" },
  { text: "Ninguna pérdida es más deshonrosa que la del tiempo, porque es la única que no se puede reparar.", author: "Séneca" },
  { text: "No dejes que el futuro te perturbe. Te enfrentarás a él, si es necesario, con las mismas armas de la razón que hoy te arman contra el presente.", author: "Marco Aurelio" },
  { text: "La persistencia y la resistencia son las dos cualidades que te abrirán todas las puertas; aguanta y mantente firme.", author: "Epicteto" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "Dentro de veinte años estarás más decepcionado por las cosas que no hiciste, que por las que hiciste. Así que suelta las amarras.", author: "Mark Twain" },
  { text: "El mejor momento para plantar un árbol era hace 20 años. El segundo mejor momento es ahora.", author: "Proverbio chino" },
  { text: "La vida no es siempre una cuestión de tener buenas cartas, sino de jugar bien una mano mala.", author: "Robert Louis Stevenson" },
  { text: "La magia es creer en ti mismo. Si puedes hacer eso, puedes hacer que suceda cualquier cosa.", author: "Johann Wolfgang von Goethe" },
  { text: "No tienes que ser grande para empezar. Pero tienes que empezar para poder ser grande.", author: "Zig Ziglar" },
  { text: "Todo lo que siempre has querido está al otro lado del miedo.", author: "George Addair" },
  { text: "No puedes vencer a alguien que nunca se rinde.", author: "Babe Ruth" },
  { text: "Nunca renuncies a un sueño por el tiempo que se requiere para lograrlo. El tiempo pasará de todas formas.", author: "Earl Nightingale" },
  { text: "La función propia del hombre es vivir, no existir. No perderé mis días tratando de prolongarlos. Voy a aprovechar mi tiempo.", author: "Jack London" },
];

const features = [
  { icon: Clock, text: 'Cronómetro inteligente por sesión de trabajo' },
  { icon: Zap, text: 'Tablero Kanban con estimaciones de tiempo' },
  { icon: BarChart2, text: 'Dashboard de productividad semanal' },
];

export function LandingPage() {
  const { navigate, setIsAuthenticated, login, register } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const submitDisabled = loading || (authMode === 'register' && name.trim().length < 2);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isQuotePaused, setIsQuotePaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const QUOTE_DURATION = 10000; // 10 seconds
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  const goToNext = (dir: 1 | -1 = 1) => {
    setDirection(dir);
    setCurrentQuoteIndex(prev =>
      dir === 1
        ? (prev + 1) % INSPIRATIONAL_QUOTES.length
        : (prev - 1 + INSPIRATIONAL_QUOTES.length) % INSPIRATIONAL_QUOTES.length
    );
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // Progress bar animation via rAF
  useEffect(() => {
    if (isQuotePaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / QUOTE_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        goToNext(1);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [currentQuoteIndex, isQuotePaused]);

  const handleNextQuote = () => goToNext(1);
  const handlePrevQuote = () => goToNext(-1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'register') {
        await register(name.trim(), email, password);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      console.error(error);
      let errMsg = authMode === 'register'
        ? 'No pudimos crear la cuenta. Revisa los datos.'
        : 'No pudimos iniciar sesión. Revisa tus credenciales.';

      if (error && error.details && typeof error.details === 'object') {
        const details = error.details as Record<string, string[]>;
        const messages: string[] = [];
        
        // Mapeo amigable para el usuario en español
        const fieldTranslations: Record<string, string> = {
          name: 'Nombre',
          email: 'Correo electrónico',
          password: 'Contraseña'
        };

        Object.entries(details).forEach(([field, msgs]) => {
          if (Array.isArray(msgs)) {
            const translatedField = fieldTranslations[field] ?? field;
            // Traducir mensajes comunes de zod
            const translatedMsgs = msgs.map(m => {
              if (m.includes('at least 8 character')) return 'debe tener al menos 8 caracteres';
              if (m.includes('at least 2 character')) return 'debe tener al menos 2 caracteres';
              if (m.includes('Invalid email')) return 'correo no válido';
              return m;
            });
            messages.push(`${translatedField}: ${translatedMsgs.join(', ')}`);
          }
        });
        
        if (messages.length > 0) {
          errMsg = `Datos inválidos:\n${messages.join('\n')}`;
        }
      } else if (error && error.message) {
        errMsg = error.message;
      }
      
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
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
          className="flex items-center gap-4 mb-12"
        >
          <img 
            src={logoImg} 
            alt="TEMPUS Logo" 
            style={{ 
              width: 38, 
              height: 38, 
              borderRadius: 10, 
              objectFit: 'cover',
              border: `1px solid rgba(154, 27, 27, 0.3)`,
              boxShadow: '0 4px 12px rgba(154, 27, 27, 0.15)'
            }} 
          />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 26,
              color: DARK.text,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            TEM<span style={{ color: DARK.wine }}>PUS</span>
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
              fontFamily: "'Cinzel', serif",
              fontSize: 38,
              lineHeight: 1.3,
              color: DARK.text,
              marginBottom: 16,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
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
              marginBottom: 32,
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

          {/* ── Quote Rotator Widget ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              marginTop: 44,
              position: 'relative',
              maxWidth: 500,
            }}
            onMouseEnter={() => setIsQuotePaused(true)}
            onMouseLeave={() => setIsQuotePaused(false)}
          >
            {/* Red vertical accent bar */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${DARK.carmine}, ${DARK.wine}80)`,
              boxShadow: `0 0 18px ${DARK.wine}60`,
            }} />

            {/* Huge decorative quote mark */}
            <div style={{
              position: 'absolute',
              top: -28,
              left: 20,
              fontSize: 120,
              fontFamily: "'Cinzel', serif",
              color: `${DARK.wine}18`,
              userSelect: 'none',
              lineHeight: 1,
              pointerEvents: 'none',
            }}>“</div>

            {/* Quote text area */}
            <div style={{ paddingLeft: 24, paddingRight: 8, minHeight: 130 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentQuoteIndex}
                  custom={direction}
                  initial={{ opacity: 0, y: direction * 22, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: direction * -18, filter: 'blur(3px)' }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 17,
                    lineHeight: 1.75,
                    color: '#F5F0E8',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    marginBottom: 16,
                    letterSpacing: '0.01em',
                  }}>
                    “{INSPIRATIONAL_QUOTES[currentQuoteIndex].text}”
                  </p>
                  <p style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12,
                    color: DARK.carmine,
                    letterSpacing: '0.2em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    — {INSPIRATIONAL_QUOTES[currentQuoteIndex].author}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar + controls row */}
            <div style={{ paddingLeft: 24, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: 2,
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${DARK.wine}, ${DARK.carmine})`,
                  borderRadius: 999,
                  transition: isQuotePaused ? 'none' : undefined,
                  boxShadow: `0 0 8px ${DARK.wine}80`,
                }} />
              </div>

              {/* Controls row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Dot indicators */}
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {INSPIRATIONAL_QUOTES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setDirection(idx > currentQuoteIndex ? 1 : -1); setCurrentQuoteIndex(idx); setProgress(0); startTimeRef.current = Date.now(); }}
                      style={{
                        width: idx === currentQuoteIndex ? 18 : 5,
                        height: 5,
                        borderRadius: 999,
                        background: idx === currentQuoteIndex
                          ? `linear-gradient(90deg, ${DARK.carmine}, ${DARK.wine})`
                          : 'rgba(255,255,255,0.18)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: idx === currentQuoteIndex ? `0 0 6px ${DARK.wine}80` : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Arrow + pause buttons */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handlePrevQuote}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: DARK.muted,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${DARK.wine}30`; e.currentTarget.style.color = DARK.text; e.currentTarget.style.borderColor = `${DARK.wine}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = DARK.muted; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <ChevronLeft size={13} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsQuotePaused(p => !p)}
                    style={{
                      height: 28,
                      padding: '0 10px',
                      borderRadius: 8,
                      background: isQuotePaused ? `${DARK.wine}30` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isQuotePaused ? `${DARK.wine}60` : 'rgba(255,255,255,0.08)'}`,
                      color: isQuotePaused ? DARK.text : DARK.muted,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {isQuotePaused ? '▶ Play' : '⏸ Pausar'}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuote}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: DARK.muted,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${DARK.wine}30`; e.currentTarget.style.color = DARK.text; e.currentTarget.style.borderColor = `${DARK.wine}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = DARK.muted; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <ChevronRight size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
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
            {authMode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
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
            {authMode === 'register' && (
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
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Alejandro Garcia"
                  style={{
                    width: '100%',
                    height: 40,
                    backgroundColor: DARK.hover,
                    border: `1px solid ${nameFocused ? DARK.carmine : DARK.divider}`,
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
            )}

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
              disabled={submitDisabled}
              style={{
                width: '100%',
                height: 40,
                backgroundColor: submitDisabled ? DARK.hover : DARK.wine,
                border: 'none',
                borderRadius: 999,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: DARK.text,
                cursor: submitDisabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
              }}
              onMouseEnter={e => !submitDisabled && (e.currentTarget.style.backgroundColor = DARK.carmine)}
              onMouseLeave={e => !submitDisabled && (e.currentTarget.style.backgroundColor = DARK.wine)}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" dur="0.8s" from="0 12 12" to="360 12 12" repeatCount="indefinite" />
                  </path>
                </svg>
              ) : (
                authMode === 'register' ? 'Crear cuenta' : 'Entrar'
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
            {authMode === 'register' ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
            <button
              onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
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
              {authMode === 'register' ? 'Inicia sesion' : 'Registrate'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
