import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { useApp } from '../components/timeflow/AppContext';

const DARK = {
  page: '#0D0D0D',
  panel: '#161614',
  card: '#1F1F1C',
  hover: '#2A2A26',
  divider: '#333330',
  text: '#F5F0E8',
  muted: '#A09E98',
  disabled: '#5C5C58',
  wine: '#8B1A2F',
  carmine: '#A8263D',
};

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TIMEZONES = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'Europe/Madrid',
];

export function OnboardingPage() {
  const { navigate, updateProfile, addTask } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4]);
  const [firstTask, setFirstTask] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [taskFocused, setTaskFocused] = useState(false);

  const steps = [
    { title: 'Tu perfil', subtitle: 'Personaliza tu experiencia en TimeFlow' },
    { title: 'Tu semana', subtitle: 'Define tus días activos de trabajo' },
    { title: 'Primera tarea', subtitle: 'Crea tu primera tarea para empezar' },
  ];

  const toggleDay = (i: number) => {
    setActiveDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    );
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      try {
        // Persistir perfil y primera tarea antes de entrar
        await updateProfile({ name, timezone });
        await addTask({
          id: `first-${Date.now()}`,
          title: firstTask,
          description: 'Mi primera tarea creada en el onboarding',
          status: 'planned',
          tags: [],
          estimatedTime: 60,
          actualTime: 0,
          date: new Date().toISOString().split('T')[0],
          priority: 'medium',
          sessions: [],
        });
        navigate('dashboard');
      } catch (error) {
        console.error("Error finalizando onboarding:", error);
      }
    }
  };

  const canContinue = step === 0 ? name.length > 1 : step === 1 ? activeDays.length > 0 : firstTask.length > 1;

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: DARK.page,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {/* Grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}>
        <filter id="noise2">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise2)" />
      </svg>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
          <line x1="12" y1="12" x2="12" y2="4" stroke={DARK.text} strokeWidth="2" />
          <line x1="12" y1="12" x2="19" y2="12" stroke={DARK.wine} strokeWidth="2" />
        </svg>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: DARK.text }}>
          Time<span style={{ color: DARK.wine }}>Flow</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              style={{
                width: i <= step ? (i < step ? 24 : 24) : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: i < step ? DARK.wine : i === step ? DARK.wine : DARK.divider,
                transition: 'all 300ms ease',
                opacity: i > step ? 0.4 : 1,
              }}
            />
          </div>
        ))}
      </div>

      {/* Card */}
      <motion.div
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: DARK.panel,
          borderRadius: 16,
          border: `1px solid ${DARK.divider}`,
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                color: DARK.text,
                marginBottom: 6,
                lineHeight: 1.2,
              }}
            >
              {steps[step].title}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: DARK.muted,
                marginBottom: 32,
              }}
            >
              {steps[step].subtitle}
            </p>

            {/* Step 0: Name & timezone */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: DARK.muted, display: 'block', marginBottom: 6 }}>
                    Tu nombre
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Alejandro"
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
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: DARK.muted, display: 'block', marginBottom: 6 }}>
                    Zona horaria
                  </label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor: DARK.hover,
                      border: `1px solid ${DARK.divider}`,
                      borderRadius: 10,
                      padding: '0 14px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      color: DARK.text,
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz} style={{ backgroundColor: DARK.panel }}>
                        {tz.replace('/', ' / ').replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 1: Active days */}
            {step === 1 && (
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: DARK.disabled, marginBottom: 16 }}>
                  Selecciona los días en que trabajas habitualmente
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {DAYS.map((day, i) => {
                    const active = activeDays.includes(i);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(i)}
                        style={{
                          height: 48,
                          borderRadius: 10,
                          border: `1px solid ${active ? DARK.wine : DARK.divider}`,
                          backgroundColor: active ? `${DARK.wine}22` : 'transparent',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          fontWeight: 500,
                          color: active ? DARK.text : DARK.muted,
                          cursor: 'pointer',
                          transition: 'all 120ms ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                        }}
                      >
                        {day}
                        {active && (
                          <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: DARK.wine }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: DARK.disabled, marginTop: 12 }}>
                  {activeDays.length} de 7 días seleccionados
                </p>
              </div>
            )}

            {/* Step 2: First task */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: DARK.muted, display: 'block', marginBottom: 6 }}>
                    Nombre de la tarea
                  </label>
                  <input
                    autoFocus
                    value={firstTask}
                    onChange={e => setFirstTask(e.target.value)}
                    onFocus={() => setTaskFocused(true)}
                    onBlur={() => setTaskFocused(false)}
                    placeholder="ej. Diseñar pantalla de inicio"
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor: DARK.hover,
                      border: `1px solid ${taskFocused ? DARK.carmine : DARK.divider}`,
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
                <div
                  style={{
                    backgroundColor: DARK.card,
                    borderRadius: 10,
                    padding: 16,
                    border: `1px solid ${DARK.divider}`,
                  }}
                >
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: DARK.disabled, marginBottom: 4 }}>
                    Tu primera tarea aparecerá en
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: DARK.muted }}>
                    Tablero Kanban → Columna <span style={{ color: DARK.text }}>Planeado</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-10">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 999,
                border: `1px solid ${DARK.divider}`,
                backgroundColor: 'transparent',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: DARK.muted,
                cursor: 'pointer',
              }}
            >
              Atrás
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canContinue}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: 'none',
              backgroundColor: canContinue ? DARK.wine : DARK.hover,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: canContinue ? DARK.text : DARK.disabled,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              transition: 'background-color 120ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={e => canContinue && (e.currentTarget.style.backgroundColor = DARK.carmine)}
            onMouseLeave={e => canContinue && (e.currentTarget.style.backgroundColor = DARK.wine)}
          >
            {step === 2 ? (
              <>
                <Check size={14} strokeWidth={2} />
                Comenzar
              </>
            ) : (
              'Continuar'
            )}
          </button>
        </div>

        {step === 0 && (
          <button
            onClick={() => navigate('dashboard')}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: DARK.disabled,
              cursor: 'pointer',
              marginTop: 16,
              padding: 8,
            }}
          >
            Omitir por ahora
          </button>
        )}
      </motion.div>
    </div>
  );
}
