import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, ChevronUp, ChevronDown, Music } from 'lucide-react';
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

// Campana tibetana sintética de inicio
function playSoftBell() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5 fundamental
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now); // G5 armónico perfecto
    
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.08); // ataque suave
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // desvanecimiento lento
    
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

// Campanillas cristalinas de finalización/detención
function playChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6 arpegio mayor
    
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

// Estado del Sintetizador de Ruido Ambiente
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGainNode: GainNode | null = null;
let ambientFilterNode: BiquadFilterNode | null = null;

function stopAmbient() {
  if (ambientSource) {
    try {
      ambientSource.stop();
    } catch (e) {}
    ambientSource.disconnect();
    ambientSource = null;
  }
  if (ambientGainNode) {
    ambientGainNode.disconnect();
    ambientGainNode = null;
  }
  if (ambientFilterNode) {
    ambientFilterNode.disconnect();
    ambientFilterNode = null;
  }
}

function startAmbient(type: 'white_noise' | 'rain', volume: number) {
  stopAmbient();
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    
    // Crear búfer de ruido blanco
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    ambientSource = ctx.createBufferSource();
    ambientSource.buffer = noiseBuffer;
    ambientSource.loop = true;
    
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime((volume / 100) * 0.12, now); // volumen calibrado
    
    if (type === 'rain') {
      // La lluvia se simula filtrando ruido blanco con lowpass bajo y resonancia natural
      ambientFilterNode = ctx.createBiquadFilter();
      ambientFilterNode.type = 'lowpass';
      ambientFilterNode.frequency.setValueAtTime(600, now);
      
      ambientSource.connect(ambientFilterNode);
      ambientFilterNode.connect(ambientGainNode);
    } else {
      // Ruido blanco
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
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────

export function TimerWidget() {
  const { timerState, stopTimer, toggleTimerPause, tasks, colors } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'white_noise' | 'rain' | 'lofi' | 'nature'>('none');
  const [ambientVolume, setAmbientVolume] = useState(40);
  
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

  // Efecto 1: Detectar cuando el temporizador inicia o se detiene para las campanas
  useEffect(() => {
    const wasActive = prevActiveRef.current;
    const isActive = timerState.isActive;

    if (!wasActive && isActive) {
      playSoftBell();
    } else if (wasActive && !isActive) {
      playChime();
    }

    prevActiveRef.current = isActive;
  }, [timerState.isActive]);

  // Efecto 2: Sincronizar audio de fondo basado en estado de pausa y selección
  useEffect(() => {
    const isPlaying = timerState.isActive && !timerState.isPaused;

    // Apagar todos los audios activos
    stopAmbient();
    if (lofiAudioRef.current) lofiAudioRef.current.pause();
    if (natureAudioRef.current) natureAudioRef.current.pause();

    if (isPlaying) {
      if (ambientSound === 'white_noise' || ambientSound === 'rain') {
        startAmbient(ambientSound, ambientVolume);
      } else if (ambientSound === 'lofi') {
        if (lofiAudioRef.current) {
          lofiAudioRef.current.volume = (ambientVolume / 100) * 0.35;
          lofiAudioRef.current.play().catch(err => console.warn('Autoplay bloqueado', err));
        }
      } else if (ambientSound === 'nature') {
        if (natureAudioRef.current) {
          natureAudioRef.current.volume = (ambientVolume / 100) * 0.35;
          natureAudioRef.current.play().catch(err => console.warn('Autoplay bloqueado', err));
        }
      }
    }
  }, [timerState.isActive, timerState.isPaused, ambientSound]);

  // Efecto 3: Sincronizar volumen reactivo
  useEffect(() => {
    updateAmbientVolume(ambientVolume);
    if (lofiAudioRef.current) {
      lofiAudioRef.current.volume = (ambientVolume / 100) * 0.35;
    }
    if (natureAudioRef.current) {
      natureAudioRef.current.volume = (ambientVolume / 100) * 0.35;
    }
  }, [ambientVolume]);

  if (!timerState.isActive) return null;

  // ────────────────────────────────────────────────────────
  // LOGICA DE UMBRALES DE COLOR (PROGRESO VS ESTIMADO)
  // ────────────────────────────────────────────────────────
  
  let timerColor = colors.accent.terra;
  let isOvertime = false;
  let progressPercent = 0;

  if (activeTask && activeTask.estimatedTime > 0) {
    const elapsedMinutes = timerState.seconds / 60;
    progressPercent = Math.min(100, (elapsedMinutes / activeTask.estimatedTime) * 100);
    
    if (elapsedMinutes > activeTask.estimatedTime) {
      timerColor = '#9A1B1B'; // Rojo carmesí del logo (Overtime)
      isOvertime = true;
      progressPercent = 100;
    } else if (elapsedMinutes / activeTask.estimatedTime > 0.9) {
      timerColor = '#8B1A2F'; // Vino profundo
    } else if (elapsedMinutes / activeTask.estimatedTime > 0.5) {
      timerColor = '#C4914A'; // Ámbar de enfoque activo
    } else {
      timerColor = '#C4614A'; // Tierra elegante de inicio
    }
  }

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
        border: `1px solid ${isOvertime ? 'rgba(154,27,27,0.4)' : colors.bg.divider}`,
        borderRadius: 16,
        boxShadow: `0 8px 32px ${isOvertime ? 'rgba(154,27,27,0.18)' : 'rgba(0,0,0,0.25)'}`,
        zIndex: 100,
        overflow: 'hidden',
        width: expanded ? 280 : 220,
        transition: 'border-color 300ms ease, box-shadow 300ms ease',
      }}
    >
      {/* Compact header */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        style={{ padding: expanded ? '16px 16px 12px' : '12px 16px' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Active indicator */}
        <div
          className={timerState.isActive && !timerState.isPaused ? 'tf-dot-active' : ''}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: timerColor,
            flexShrink: 0,
            animation: isOvertime ? 'tf-timer-pulse 800ms ease-in-out infinite' : undefined,
          }}
        />

        {/* Time display */}
        <span
          className={timerState.isActive && !timerState.isPaused ? 'tf-timer-active' : ''}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 20,
            fontWeight: 400,
            color: timerColor,
            letterSpacing: '0.02em',
            flex: 1,
            animation: isOvertime ? 'tf-timer-pulse 800ms ease-in-out infinite' : undefined,
            transition: 'color 300ms ease',
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
            backgroundColor: timerColor,
            width: `${progressPercent}%`,
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
                    fontWeight: 500,
                    color: timerColor,
                    marginBottom: 16,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'color 300ms ease',
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
                    width: 44,
                    height: 44,
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
                    <Play size={16} strokeWidth={1.5} fill={colors.text.primary} style={{ color: colors.text.primary }} />
                  ) : (
                    <Pause size={16} strokeWidth={1.5} style={{ color: colors.text.primary }} />
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopTimer}
                  style={{
                    width: 32,
                    height: 32,
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
                  <Square size={12} strokeWidth={1.5} style={{ color: colors.text.secondary }} />
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: colors.text.disabled }}>
                    Estimado
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 400, color: colors.text.secondary }}>
                    {activeTask ? `${activeTask.estimatedTime}min` : '--'}
                  </div>
                </div>
              </div>

              {/* CONTROLES DE AUDIO PREMIUM */}
              <div 
                style={{ 
                  marginTop: 16, 
                  paddingTop: 12, 
                  borderTop: `1px solid ${colors.bg.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Music size={12} style={{ color: colors.text.secondary }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, color: colors.text.secondary }}>
                    Sonido Ambiente
                  </span>
                </div>
                
                <select
                  value={ambientSound}
                  onChange={e => setAmbientSound(e.target.value as any)}
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg.hover,
                    border: `1px solid ${colors.bg.divider}`,
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: colors.text.primary,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="none">🔇 Ninguno</option>
                  <option value="white_noise">🌀 Ruido Blanco (Zen)</option>
                  <option value="rain">🌧️ Lluvia Relajante</option>
                  <option value="lofi">🎸 Lofi Focus Beats</option>
                  <option value="nature">🍃 Bosque & Aves</option>
                </select>

                {ambientSound !== 'none' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: colors.text.disabled, minWidth: 40 }}>Vol: {ambientVolume}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ambientVolume}
                      onChange={e => setAmbientVolume(Number(e.target.value))}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.bg.divider,
                        appearance: 'none',
                        cursor: 'pointer',
                        accentColor: timerColor
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
