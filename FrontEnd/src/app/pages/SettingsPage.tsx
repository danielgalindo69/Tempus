import { useState } from 'react';
import { User, Palette, Bell, Calendar, Tag, Shield, Plus, Trash2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../components/timeflow/AppContext';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'workweek', label: 'Semana laboral', icon: Calendar },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'account', label: 'Cuenta', icon: Shield },
];

const ACCENT_OPTIONS = [
  { name: 'Vino', color: '#8B1A2F' },
  { name: 'Cobalto', color: '#2B5BA1' },
  { name: 'Bosque', color: '#2D6A4F' },
  { name: 'Cobre', color: '#B5541A' },
  { name: 'Pizarra', color: '#4B5563' },
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function InputField({ label, value, onChange, type = 'text', focused, onFocus, onBlur, colors }: any) {
  return (
    <div>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={onFocus} onBlur={onBlur}
        style={{
          width: '100%', height: 40, backgroundColor: colors.bg.hover,
          border: `1px solid ${focused ? colors.accent.carmine : colors.bg.divider}`,
          borderRadius: 10, padding: '0 14px',
          fontFamily: "'Inter', sans-serif", fontSize: 14,
          color: colors.text.primary, outline: 'none',
          transition: 'border-color 120ms ease', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export function SettingsPage() {
  const {
    colors,
    darkMode,
    toggleDarkMode,
    userName,
    currentUser,
    updateProfile,
    tags,
    createTag,
    deleteTag,
    logout,
  } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [focusedField, setFocusedField] = useState('');

  // Profile state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(currentUser?.email ?? 'alejandro@timeflow.app');
  const [timezone, setTimezone] = useState(currentUser?.timezone ?? 'America/Mexico_City');

  // Appearance
  const [selectedAccent, setSelectedAccent] = useState(0);

  // Notifications
  const [pomodoroAlert, setPomodoroAlert] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [taskReminder, setTaskReminder] = useState(false);

  // Work week
  const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4]);
  const [dailyHours, setDailyHours] = useState(8);

  // Tags
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B5A8A');

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 999,
        backgroundColor: value ? colors.accent.wine : colors.bg.hover,
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background-color 200ms ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18, height: 18, borderRadius: '50%', backgroundColor: colors.text.primary,
          position: 'absolute', top: 3, transition: 'left 200ms ease',
          left: value ? 23 : 3,
        }}
      />
    </button>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-6" style={{ borderBottom: `1px solid ${colors.bg.divider}` }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: colors.accent.wine, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500, color: colors.text.primary, fontFamily: "'Instrument Serif', serif", flexShrink: 0 }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: colors.text.primary, marginBottom: 2 }}>{name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.secondary }}>{email}</p>
              </div>
            </div>

            <InputField label="Nombre" value={name} onChange={setName} focused={focusedField === 'name'} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')} colors={colors} />
            <InputField label="Email" value={email} onChange={setEmail} type="email" focused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} colors={colors} />

            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: colors.text.secondary, display: 'block', marginBottom: 6 }}>Zona horaria</label>
              <select
                value={timezone} onChange={e => setTimezone(e.target.value)}
                style={{ width: '100%', height: 40, backgroundColor: colors.bg.hover, border: `1px solid ${colors.bg.divider}`, borderRadius: 10, padding: '0 14px', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                {['America/Mexico_City', 'America/Bogota', 'Europe/Madrid', 'America/New_York'].map(tz => (
                  <option key={tz} value={tz} style={{ backgroundColor: colors.bg.panel }}>{tz.replace('/', ' / ').replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => updateProfile({ name, timezone })}
              style={{ height: 40, width: 'fit-content', padding: '0 24px', borderRadius: 999, backgroundColor: colors.accent.wine, border: 'none', fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, cursor: 'pointer', transition: 'background-color 120ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accent.carmine)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.wine)}
            >
              Guardar cambios
            </button>
          </div>
        );

      case 'appearance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Dark/light mode */}
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>Modo de color</h3>
              <div className="flex gap-3">
                {[{ label: 'Oscuro', icon: Moon, dark: true }, { label: 'Claro', icon: Sun, dark: false }].map(({ label, icon: Icon, dark }) => (
                  <button
                    key={label}
                    onClick={() => { if (dark !== darkMode) toggleDarkMode(); }}
                    style={{
                      flex: 1, height: 72, borderRadius: 12,
                      border: `1px solid ${darkMode === dark ? colors.accent.wine : colors.bg.divider}`,
                      backgroundColor: darkMode === dark ? `${colors.accent.wine}22` : colors.bg.card,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 120ms ease',
                    }}
                  >
                    <Icon size={20} strokeWidth={1.5} style={{ color: darkMode === dark ? colors.accent.wine : colors.text.secondary }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: darkMode === dark ? colors.text.primary : colors.text.secondary }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>Color de acento</h3>
              <div className="flex gap-3">
                {ACCENT_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.name}
                    onClick={() => setSelectedAccent(i)}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', backgroundColor: opt.color,
                      border: `2px solid ${i === selectedAccent ? colors.text.primary : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 120ms ease', outline: 'none',
                    }}
                    title={opt.name}
                  />
                ))}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.disabled, marginTop: 8 }}>
                {ACCENT_OPTIONS[selectedAccent].name} es el color de acento actual
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Alertas Pomodoro', desc: 'Notificación al completar cada intervalo de 25 min', value: pomodoroAlert, onChange: setPomodoroAlert },
              { label: 'Resumen diario', desc: 'Recibe un resumen de tu día a las 7pm', value: dailySummary, onChange: setDailySummary },
              { label: 'Recordatorio de tareas', desc: 'Aviso cuando una tarea vence hoy', value: taskReminder, onChange: setTaskReminder },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
                style={{ padding: '16px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.bg.divider}` : 'none' }}
              >
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: colors.text.secondary }}>{item.desc}</p>
                </div>
                <Toggle value={item.value} onChange={item.onChange} />
              </div>
            ))}
          </div>
        );

      case 'workweek':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>Días activos</h3>
              <div className="tf-days-grid">
                {DAYS.map((day, i) => {
                  const active = activeDays.includes(i);
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDays(prev => active ? prev.filter(d => d !== i) : [...prev, i])}
                      style={{
                        height: 56, borderRadius: 10,
                        border: `1px solid ${active ? colors.accent.wine : colors.bg.divider}`,
                        backgroundColor: active ? `${colors.accent.wine}22` : 'transparent',
                        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                        color: active ? colors.text.primary : colors.text.secondary,
                        cursor: 'pointer', transition: 'all 120ms ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}
                    >
                      {day.slice(0, 3)}
                      {active && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.accent.wine }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>
                Horas objetivo por día: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, color: colors.accent.wine }}>{dailyHours}h</span>
              </h3>
              <input
                type="range" min={1} max={12} value={dailyHours} onChange={e => setDailyHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: colors.accent.wine, cursor: 'pointer' }}
              />
              <div className="flex justify-between">
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>1h</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: colors.text.disabled }}>12h</span>
              </div>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-3"
                style={{ padding: '10px 0', borderBottom: `1px solid ${colors.bg.divider}` }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: tag.color }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.primary, flex: 1 }}>{tag.name}</span>
                <button
                  onClick={() => deleteTag(tag.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: colors.text.disabled, padding: 4 }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <input
                type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.bg.divider}`, cursor: 'pointer', padding: 2, backgroundColor: 'transparent' }}
              />
              <input
                value={newTagName} onChange={e => setNewTagName(e.target.value)}
                placeholder="Nombre del tag"
                style={{ flex: 1, height: 36, backgroundColor: colors.bg.hover, border: `1px solid ${colors.bg.divider}`, borderRadius: 8, padding: '0 12px', fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.primary, outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={() => {
                  if (!newTagName.trim()) return;
                  createTag(newTagName.trim(), newTagColor);
                  setNewTagName('');
                }}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, backgroundColor: colors.accent.wine, border: 'none', fontFamily: "'Inter', sans-serif", fontSize: 13, color: colors.text.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={13} strokeWidth={2} /> Añadir
              </button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>Seguridad</h3>
              <button
                style={{ height: 40, padding: '0 20px', borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = colors.text.secondary)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = colors.bg.divider)}
              >
                Cambiar contraseña
              </button>
            </div>

            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: colors.text.primary, marginBottom: 12 }}>Datos</h3>
              <button
                onClick={() => toast.success('Exportación iniciada')}
                style={{ height: 40, padding: '0 20px', borderRadius: 999, border: `1px solid ${colors.bg.divider}`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: colors.text.secondary, cursor: 'pointer' }}
              >
                Exportar mis datos
              </button>
            </div>

            <div
              style={{
                borderTop: `2px solid #C0392B33`, paddingTop: 24, marginTop: 12,
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#C0392B', marginBottom: 12, fontWeight: 500 }}>
                Zona de peligro
              </p>
              <button
                onClick={() => { logout(); toast.error('Sesion cerrada'); }}
                style={{ height: 40, padding: '0 20px', borderRadius: 999, border: `1px solid #C0392B44`, backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#C0392B', cursor: 'pointer', transition: 'all 120ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C0392B22'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tf-responsive-settings-layout" style={{ maxWidth: 760 }}>
      {/* Secondary nav – vertical on md+, horizontal scroll on mobile */}
      <nav className="tf-settings-nav-wrapper" style={{ flexShrink: 0 }}>
        <div className="tf-settings-nav-inner">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="tf-settings-nav-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0 12px', borderRadius: 8, border: 'none',
                  backgroundColor: active ? `${colors.accent.wine}22` : 'transparent',
                  cursor: 'pointer', transition: 'all 120ms ease',
                  fontFamily: "'Inter', sans-serif", fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? colors.text.primary : colors.text.secondary,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.backgroundColor = colors.bg.hover)}
                onMouseLeave={e => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon size={15} strokeWidth={1.5} style={{ color: active ? colors.accent.wine : colors.text.secondary }} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 26,
                color: colors.text.primary,
                marginBottom: 28,
                lineHeight: 1.2,
              }}
            >
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
