import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Music, X, Clock } from 'lucide-react';
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

// ────────────────────────────────────────────────────────
// SÍNTESIS DE AUDIO MEDIANTE WEB AUDIO API
// ────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playSoftBell() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now);
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.0);
    osc2.stop(now + 3.0);
  } catch (e) {
    console.warn('AudioContext no inicializado', e);
  }
}

function playChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = now + idx * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.6);
    });
  } catch (e) {
    console.warn('AudioContext no inicializado', e);
  }
}

let ambientSource: AudioBufferSourceNode | null = null;
let ambientGainNode: GainNode | null = null;
let ambientFilterNode: BiquadFilterNode | null = null;

function stopAmbient() {
  if (ambientSource) {
    try { ambientSource.stop(); } catch (e) {}
    ambientSource.disconnect();
    ambientSource = null;
  }
  if (ambientGainNode) { ambientGainNode.disconnect(); ambientGainNode = null; }
  if (ambientFilterNode) { ambientFilterNode.disconnect(); ambientFilterNode = null; }
}

function startAmbient(type: 'white_noise' | 'rain', volume: number) {
  stopAmbient();
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
    ambientSource = ctx.createBufferSource();
    ambientSource.buffer = noiseBuffer;
    ambientSource.loop = true;
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime((volume / 100) * 0.12, now);
    if (type === 'rain') {
      ambientFilterNode = ctx.createBiquadFilter();
      ambientFilterNode.type = 'lowpass';
      ambientFilterNode.frequency.setValueAtTime(600, now);
      ambientSource.connect(ambientFilterNode);
      ambientFilterNode.connect(ambientGainNode);
    } else {
      ambientSource.connect(ambientGainNode);
    }
    ambientGainNode.connect(ctx.destination);
    ambientSource.start(now);
  } catch (e) {
    console.warn('Fallo al iniciar el audio sintetizado', e);
  }
}

function updateAmbientVolume(volume: number) {
  if (ambientGainNode) {
    try {
      const ctx = getAudioContext();
      ambientGainNode.gain.setValueAtTime((volume / 100) * 0.12, ctx.currentTime);
    } catch (e) {}
  }
}

// ────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — FULLSCREEN TIMER
// ────────────────────────────────────────────────────────

export function TimerWidget() {
  const { timerState, stopTimer, toggleTimerPause, tasks, colors } = useApp();
  const [ambientSound, setAmbientSound] = useState<'none' | 'white_noise' | 'rain' | 'lofi' | 'nature'>('none');
  const [ambientVolume, setAmbientVolume] = useState(40);
  const [showAudio, setShowAudio] = useState(false);

  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const natureAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevActiveRef = useRef(false);

  const activeTask = tasks.find(t => t.id === timerState.activeTaskId);

  // Inicializar audios en bucle de forma perezosa
  useEffect(() => {
    if (!lofiAudioRef.current) {
      lofiAudioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-dreaming-big-1082.mp3');
      lofiAudioRef.current.loop = true;
    }
    if (!natureAudioRef.current) {
      natureAudioRef.current = new Audio('https://www.soundjay.com/nature/sounds/river-1.mp3');
      natureAudioRef.current.loop = true;
    }
    return () => {
      stopAmbient();
      if (lofiAudioRef.current) lofiAudioRef.current.pause();
      if (natureAudioRef.current) natureAudioRef.current.pause();
    };
  }, []);

  // Detectar inicio/fin del temporizador para campanas
  useEffect(() => {
    const wasActive = prevActiveRef.current;
    const isActive = timerState.isActive;
    if (!wasActive && isActive) playSoftBell();
    else if (wasActive && !isActive) playChime();
    prevActiveRef.current = isActive;
  }, [timerState.isActive]);

  // Sincronizar audio de fondo
  useEffect(() => {
    const isPlaying = timerState.isActive && !timerState.isPaused;
    stopAmbient();
    if (lofiAudioRef.current) lofiAudioRef.current.pause();
    if (natureAudioRef.current) natureAudioRef.current.pause();
    if (isPlaying) {
      if (ambientSound === 'white_noise' || ambientSound === 'rain') {
        startAmbient(ambientSound, ambientVolume);
      } else if (ambientSound === 'lofi' && lofiAudioRef.current) {
        lofiAudioRef.current.volume = (ambientVolume / 100) * 0.35;
        lofiAudioRef.current.play().catch(err => console.warn('Autoplay bloqueado', err));
      } else if (ambientSound === 'nature' && natureAudioRef.current) {
        natureAudioRef.current.volume = (ambientVolume / 100) * 0.35;
        natureAudioRef.current.play().catch(err => console.warn('Autoplay bloqueado', err));
      }
    }
  }, [timerState.isActive, timerState.isPaused, ambientSound]);

  // Sincronizar volumen
  useEffect(() => {
    updateAmbientVolume(ambientVolume);
    if (lofiAudioRef.current) lofiAudioRef.current.volume = (ambientVolume / 100) * 0.35;
    if (natureAudioRef.current) natureAudioRef.current.volume = (ambientVolume / 100) * 0.35;
  }, [ambientVolume]);

  if (!timerState.isActive) return null;

  // ────────────────────────────────────────────────────────
  // LÓGICA DE COLORES (PROGRESO VS ESTIMADO)
  // ────────────────────────────────────────────────────────

  let timerColor = '#C4614A';
  let timerGlow = 'rgba(196, 97, 74, 0.25)';
  let isOvertime = false;
  let progressPercent = 0;
  let phaseLabel = 'Enfoque inicial';

  if (activeTask && activeTask.estimatedTime > 0) {
    const elapsedMinutes = timerState.seconds / 60;
    progressPercent = Math.min(100, (elapsedMinutes / activeTask.estimatedTime) * 100);

    if (elapsedMinutes > activeTask.estimatedTime) {
      timerColor = '#9A1B1B';
      timerGlow = 'rgba(154, 27, 27, 0.35)';
      isOvertime = true;
      progressPercent = 100;
      phaseLabel = '⚠️ Tiempo superado';
    } else if (elapsedMinutes / activeTask.estimatedTime > 0.9) {
      timerColor = '#8B1A2F';
      timerGlow = 'rgba(139, 26, 47, 0.3)';
      phaseLabel = 'Finalizando...';
    } else if (elapsedMinutes / activeTask.estimatedTime > 0.5) {
      timerColor = '#C4914A';
      timerGlow = 'rgba(196, 145, 74, 0.25)';
      phaseLabel = 'Flujo de trabajo';
    }
  }

  // Círculo SVG de progreso
  const RADIUS = 130;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  const AMBIENT_OPTIONS = [
    { value: 'none', label: '🔇 Sin sonido' },
    { value: 'white_noise', label: '🌀 Ruido Blanco' },
    { value: 'rain', label: '🌧️ Lluvia Relajante' },
    { value: 'lofi', label: '🎸 Lofi Focus Beats' },
    { value: 'nature', label: '🍃 Bosque & Aves' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at center, rgba(20,10,10,0.97) 0%, rgba(8,5,5,0.99) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Glow de fondo dinámico */}
        <motion.div
          animate={{
            opacity: timerState.isPaused ? 0.3 : [0.4, 0.7, 0.4],
            scale: timerState.isPaused ? 0.8 : [1, 1.08, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${timerGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Panel principal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            width: '100%',
            maxWidth: 560,
            padding: '48px 32px 40px',
          }}
        >
          {/* Fase / Estado */}
          <motion.div
            key={phaseLabel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: timerColor,
              marginBottom: 40,
              opacity: 0.85,
            }}
          >
            {phaseLabel}
          </motion.div>

          {/* Círculo de progreso SVG */}
          <div style={{ position: 'relative', width: 300, height: 300, marginBottom: 40 }}>
            <svg
              width="300"
              height="300"
              style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}
            >
              {/* Track */}
              <circle
                cx="150"
                cy="150"
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              {/* Progress */}
              <motion.circle
                cx="150"
                cy="150"
                r={RADIUS}
                fill="none"
                stroke={timerColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 8px ${timerColor}88)` }}
              />
            </svg>

            {/* Tiempo en el centro */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <motion.span
                animate={isOvertime ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
                transition={{ duration: 0.8, repeat: isOvertime ? Infinity : 0 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 52,
                  fontWeight: 300,
                  color: timerColor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  filter: `drop-shadow(0 0 20px ${timerColor}66)`,
                  transition: 'color 400ms ease, filter 400ms ease',
                }}
              >
                {formatTime(timerState.seconds)}
              </motion.span>

              {activeTask && activeTask.estimatedTime > 0 && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.06em',
                  }}
                >
                  de {activeTask.estimatedTime}min estimados
                </span>
              )}
            </div>
          </div>

          {/* Nombre de la tarea */}
          {activeTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                marginBottom: 40,
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Clock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Tarea activa
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.3,
                }}
              >
                {activeTask.title}
              </h2>
            </motion.div>
          )}

          {/* Controles principales */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            {/* Pause / Resume */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleTimerPause}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: timerColor,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 32px ${timerGlow}, 0 8px 24px rgba(0,0,0,0.4)`,
                transition: 'background-color 300ms ease, box-shadow 300ms ease',
              }}
            >
              {timerState.isPaused ? (
                <Play size={28} strokeWidth={1.5} fill="white" style={{ color: 'white', marginLeft: 3 }} />
              ) : (
                <Pause size={28} strokeWidth={1.5} style={{ color: 'white' }} />
              )}
            </motion.button>

            {/* Stop */}
            <motion.button
              whileHover={{ scale: 1.06, borderColor: 'rgba(255,255,255,0.5)' }}
              whileTap={{ scale: 0.94 }}
              onClick={stopTimer}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 200ms ease',
              }}
            >
              <Square size={18} strokeWidth={1.5} fill="rgba(255,255,255,0.7)" style={{ color: 'rgba(255,255,255,0.7)' }} />
            </motion.button>
          </div>

          {/* Estado de pausa */}
          {timerState.isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              Pausado
            </motion.div>
          )}

          {/* Panel de sonido ambiente (collapsible) */}
          <div style={{ width: '100%', maxWidth: 360 }}>
            <button
              onClick={() => setShowAudio(prev => !prev)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: showAudio ? 'rgba(255,255,255,0.05)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <Music size={13} />
              Sonido Ambiente
              {ambientSound !== 'none' && (
                <span style={{ color: timerColor, fontSize: 10 }}>
                  ● {AMBIENT_OPTIONS.find(o => o.value === ambientSound)?.label}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showAudio && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      marginTop: 8,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {/* Opciones de sonido */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {AMBIENT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setAmbientSound(opt.value as any)}
                          style={{
                            height: 34,
                            borderRadius: 7,
                            border: `1px solid ${ambientSound === opt.value ? timerColor : 'transparent'}`,
                            backgroundColor: ambientSound === opt.value ? `${timerColor}18` : 'transparent',
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            color: ambientSound === opt.value ? timerColor : 'rgba(255,255,255,0.5)',
                            textAlign: 'left',
                            padding: '0 10px',
                            transition: 'all 150ms ease',
                          }}
                          onMouseEnter={e => { if (ambientSound !== opt.value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={e => { if (ambientSound !== opt.value) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Slider de volumen */}
                    {ambientSound !== 'none' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', minWidth: 50 }}>
                          Vol: {ambientVolume}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={ambientVolume}
                          onChange={e => setAmbientVolume(Number(e.target.value))}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            appearance: 'none',
                            cursor: 'pointer',
                            accentColor: timerColor,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint para cerrar (stop = finalizar sesión) */}
          <div
            style={{
              marginTop: 24,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            Presiona ■ para finalizar y guardar la sesión
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
