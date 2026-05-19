TIMEFLOW — Figma Design System & Screen Specification
Rol: Diseñador UI/UX senior. Crear un design system completo 
y todas las pantallas de la aplicación web TimeFlow, una 
herramienta personal de gestión del tiempo con tablero Kanban, 
cronómetro de sesiones y dashboard de productividad.

════════════════════════════════════
FILOSOFÍA DE DISEÑO
════════════════════════════════════
Estilo: Editorial minimalista premium. Referentes visuales: 
Linear.app, Craft.do, Notion con refinamiento tipográfico de 
revista Kinfolk. Sensación: productividad silenciosa, control 
sin estrés, elegancia funcional.

PROHIBIDO en este diseño:
- Glassmorphism o fondos con blur decorativo
- Gradientes de colores vivos o neón
- Sombras exageradas o glow effects
- Bordes brillantes o efectos de luz
- Ilustraciones con estilo cartoon o flat 2.0
- Paletas saturadas o contrastes agresivos
- Cualquier referencia visual a estética cyberpunk

════════════════════════════════════
TIPOGRAFÍA
════════════════════════════════════
Heading display: Instrument Serif — Regular (400)
  Uso: títulos de página, nombre de la app, métricas 
  grandes del dashboard
  
UI Label: Inter — Medium (500) y Regular (400)
  Uso: labels, botones, navegación, cuerpo de texto
  
Monospace: JetBrains Mono — Light (300)
  Uso: cronómetro, números de tiempo, valores numéricos 
  del dashboard

Escala tipográfica:
  Display:  48px / line-height 1.1 / Instrument Serif
  H1:       32px / line-height 1.2 / Instrument Serif
  H2:       22px / line-height 1.3 / Inter Medium
  H3:       16px / line-height 1.4 / Inter Medium
  Body:     14px / line-height 1.6 / Inter Regular
  Caption:  12px / line-height 1.5 / Inter Regular
  Timer:    40px / line-height 1.0 / JetBrains Mono Light
  Metric:   36px / line-height 1.1 / Instrument Serif

════════════════════════════════════
PALETA DE COLORES — VARIABLES
════════════════════════════════════
── Fondos (modo oscuro, principal) ──
bg/obsidian:     #0D0D0D   ← fondo de página
bg/carbon:       #161614   ← fondo de sidebar y panels
bg/graphite:     #1F1F1C   ← superficies elevadas (cards)
bg/slate:        #2A2A26   ← hover states, inputs
bg/divider:      #333330   ← líneas divisorias

── Fondos (modo claro, alternativo) ──
bg/ivory:        #F5F0E8   ← fondo de página
bg/cream:        #EDE8DF   ← superficies y panels
bg/parchment:    #E4DDD3   ← hover states
bg/warm-white:   #FAF8F4   ← cards elevadas

── Acento primario ──
accent/wine:     #8B1A2F   ← acción principal, CTA primario
accent/carmine:  #A8263D   ← hover del CTA
accent/terra:    #C4614A   ← acento secundario, highlights
accent/salmon:   #D4886E   ← estados suaves, badges

── Texto ──
text/primary:    #F5F0E8   ← texto principal (dark mode)
text/secondary:  #A09E98   ← texto muted, labels
text/disabled:   #5C5C58   ← placeholders, deshabilitados
text/inverse:    #0D0D0D   ← texto sobre fondos claros

── Estados de tarea (semánticos) ──
state/planned:   #3B5A8A   ← indicador "Planeado"
state/progress:  #C4914A   ← indicador "En proceso"
state/done:      #3A7D5C   ← indicador "Terminado"

── Feedback ──
feedback/error:  #C0392B
feedback/warn:   #C4914A
feedback/ok:     #3A7D5C

════════════════════════════════════
ESPACIADO Y LAYOUT
════════════════════════════════════
Unidad base: 4px
Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96
Border radius:
  Pequeño (chips, badges): 6px
  Medio (cards, inputs):   10px
  Grande (modals, panels): 16px
  Pill (botones):          999px

Layout principal: sidebar fija 240px + área de contenido fluid
Sidebar colapsada: 64px (solo iconos)
Gutter interno de página: 32px
Gap entre columnas Kanban: 20px

Breakpoints:
  Desktop: 1280px+ (layout completo)
  Laptop:  1024px (sidebar colapsable)
  Tablet:  768px (sidebar en overlay)

════════════════════════════════════
DESIGN TOKENS — COMPONENTES BASE
════════════════════════════════════
Crear como componentes Figma con variantes:

1. BUTTON
   Variantes: Primary / Secondary / Ghost / Danger
   Tamaños: SM (32px) / MD (40px) / LG (48px)
   Estados: Default / Hover / Active / Disabled / Loading
   Primary: bg accent/wine, texto text/primary, hover accent/carmine
   Secondary: border 1px bg/slate, fondo transparente
   
2. INPUT FIELD
   Variantes: Default / Focus / Error / Disabled
   Altura: 40px, border-radius 10px
   Fondo: bg/slate, border 1px bg/divider
   Focus: border accent/carmine, sin glow — solo cambio de color
   
3. TASK CARD
   Tamaño: ancho 100% columna, alto variable (mínimo 80px)
   Fondo: bg/graphite, border-left 3px color del estado
   Elementos:
     - Título de tarea (Inter Medium 14px, text/primary)
     - Tiempo estimado vs real (Caption, text/secondary)
     - Tags (chips pequeños, 6px radius)
     - Drag handle (icono sutil a la izquierda, visible en hover)
     - Menú contextual (3 puntos, visible en hover)
   Hover: levanta 3px con transform translateY(-3px), 
          transición 180ms ease-out
   Variante arrastrada: opacidad 50%, escala 1.02, 
                        sombra 0 8px 24px rgba(0,0,0,0.4)
   
4. KANBAN COLUMN
   Ancho: minmax(280px, 1fr)
   Header: label de estado con dot de color + contador de tareas
   Fondo: bg/carbon, border-radius 16px, padding 16px
   Zona de drop activa: border 1px dashed accent/wine, 
                        fondo bg/slate con 40% opacidad
   
5. TIMER WIDGET
   Forma: card cuadrada o rectangular, bg/graphite
   Elementos:
     - Display tiempo: JetBrains Mono Light 40px, text/primary
     - Nombre de tarea activa: Inter Regular 13px, state/progress
     - Botón play/pause: círculo 48px, bg accent/wine
     - Botón stop: círculo 36px, bg transparent, border text/secondary
     - Barra de progreso sutil: 2px de altura, accent/terra
   Estado pulsante: cuando activo, el display tiene un pulso
                    de opacidad 100%→85% cada 1 segundo
   
6. SIDEBAR / NAV ITEM
   Altura: 40px, border-radius 8px, padding horizontal 12px
   Estados: Default / Hover / Active
   Active: bg accent/wine con 15% opacidad, 
           border-left 2px accent/wine, 
           texto text/primary
   Hover: bg bg/slate
   Íconos: Lucide Icons, 18px, stroke-width 1.5
   
7. STAT CARD (dashboard)
   Tamaño: mínimo 160px ancho
   Elementos: label caption arriba, valor display grande abajo
   Micro variante: con delta (flecha +12% verde o -3% rojo)
   Fondo: bg/graphite, sin borde
   
8. BADGE / CHIP (tags de tareas)
   Altura: 22px, padding horizontal 8px, border-radius 6px
   Fondo: color del tag con 20% opacidad
   Texto: color del tag al 100%, 11px Inter Medium
   
9. MODAL / DIALOG
   Fondo overlay: #0D0D0D con 75% opacidad
   Card modal: bg/carbon, border-radius 16px, 
               border 1px bg/divider, padding 32px
   Entrada: translateY(12px) opacity(0) → 
            translateY(0) opacity(1), 220ms ease-out
   
10. TOAST / NOTIFICATION
    Posición: bottom-right, margen 24px
    Fondo: bg/graphite, border 1px bg/divider
    Variantes: Info / Success / Warning / Error
    Borde izquierdo 3px del color semántico
    Entrada: slideInRight 200ms ease-out
    Auto-dismiss: 4 segundos con barra de progreso

════════════════════════════════════
PÁGINAS A DISEÑAR (8 pantallas)
════════════════════════════════════

── PÁGINA 1: Landing / Login ──
Layout: split screen 50/50
Lado izquierdo: 
  - Logo "TimeFlow" en Instrument Serif 32px
  - Headline display: "Tu tiempo, controlado."
  - Subheadline: descripción 2 líneas, text/secondary
  - 3 bullets con íconos Lucide: features clave
  - Fondo: bg/obsidian con textura sutil de ruido 
    (grain texture SVG, 3% opacidad — lo único permitido)
Lado derecho:
  - Card de login, bg/carbon, border-radius 16px
  - Input email + input password
  - Botón Primary "Entrar" full-width
  - Separador "o continúa con"
  - Botón Google OAuth (secondary style)
  - Link "¿No tienes cuenta? Regístrate"
Modo: solo oscuro para esta página

── PÁGINA 2: Onboarding (3 pasos) ──
Layout: centrado, máximo 480px de ancho, indicadores de paso
Paso 1: Nombre y zona horaria
Paso 2: Primer week plan — selector de días activos
Paso 3: Tutorial interactivo — crear primera tarea
Fondo: bg/obsidian
Card central: bg/carbon, padding 48px, border-radius 16px

── PÁGINA 3: Dashboard principal ──
Layout: sidebar 240px + header 64px + grid de contenido
Header:
  - Saludo dinámico: "Buenos días, [nombre]" — Instrument Serif
  - Fecha actual
  - Botón "+ Nueva tarea" (Primary, top-right)
  - Avatar de usuario con menú dropdown
Stats row (4 cards horizontales):
  - Tareas completadas hoy
  - Tiempo trabajado hoy  
  - Tiempo estimado vs real (ratio)
  - Racha de días activos (con ícono de fuego sutil)
Sección central: mini vista del tablero Kanban (3 columnas, 
  scroll horizontal en contenido, no en columnas)
Sección inferior: 
  - Gráfica semanal de tiempo por día (bar chart minimalista)
  - Lista de últimas 5 sesiones de trabajo con duración

── PÁGINA 4: Tablero Kanban ──
Layout: sidebar + header + 3 columnas fluid
Header de página:
  - Título "Tablero" + selector de semana (prev/next arrows)
  - Filtros: por tag, por prioridad
  - Vista toggle: Kanban / Lista
3 columnas Kanban:
  - Planeado / En proceso / Terminado
  - Cada columna tiene: header con contador, lista de cards, 
    botón "+ Agregar tarea" al fondo
Drag and drop visual:
  - Columna destino se ilumina con border dashed accent/wine
  - Card arrastrada tiene sombra elevada y rotación 2deg
Timer widget:
  - Flotante bottom-right, posición fija en pantalla
  - Se expande al click (altura 180px → 280px)
  - Muestra tarea activa + cronómetro + botón stop
Modal de tarea (al clickear card):
  - Panel lateral derecho (drawer), ancho 400px
  - Campos: título, descripción, estado, tags, fecha, 
    tiempo estimado
  - Historial de sesiones de tiempo debajo
  - Botón "Iniciar cronómetro" destacado

── PÁGINA 5: Vista semanal ──
Layout: sidebar + grid de 7 columnas (lun-dom)
Header: semana actual con navegación prev/next
Cada columna día:
  - Header con día y fecha, indicador "hoy" en accent/wine
  - Total de tiempo estimado del día (caption, text/secondary)
  - Stack de task cards verticales
  - Indicador de carga: barra sutil debajo del header 
    que va de verde (ok) a rojo (sobrecargado)
Interacción: drag entre días para replanificar
Columnas de fin de semana: opacidad reducida si sin tareas

── PÁGINA 6: Dashboard de análisis ──
Layout: sidebar + grid de 2 columnas
Sección top: selector de rango (Esta semana / Mes / Custom)
Métricas principales (row de 4 stat cards):
  - Total horas trabajadas
  - Tasa de completitud (%)
  - Tarea con más tiempo invertido
  - Mejor día de la semana
Gráficas:
  - Bar chart: horas por día de la semana
  - Line chart: completitud a lo largo del tiempo
  - Donut chart: distribución de tiempo por tag
  - Heatmap: actividad por hora del día (7 días × 24 horas)
    estilo GitHub contributions, colores bg/slate → accent/wine
Lista: top 5 tareas por tiempo invertido esta semana

── PÁGINA 7: Configuración ──
Layout: sidebar + panel central 640px máximo
Secciones con nav lateral secundaria:
  - Perfil: avatar, nombre, email, zona horaria
  - Apariencia: toggle dark/light mode, color de acento 
    (5 opciones predefinidas, wine es el default)
  - Notificaciones: recordatorios Pomodoro, resumen diario
  - Semana laboral: días activos, horas objetivo por día
  - Tags: CRUD de tags con selector de color
  - Cuenta: cambiar contraseña, exportar datos, 
    eliminar cuenta (zona de peligro al fondo, separada)

── PÁGINA 8: Estados vacíos y error ──
Diseñar estados vacíos para:
  - Tablero sin tareas: ilustración minimalista SVG 
    (líneas geométricas, NO ilustración con personajes)
    + mensaje + CTA "Crear primera tarea"
  - Dashboard sin datos: mensaje + CTA
  - Error 404: minimalista, solo tipografía
  - Error 500: con botón de reintento

════════════════════════════════════
ANIMACIONES E INTERACCIONES
════════════════════════════════════
Definir en Figma como prototypes y anotar para desarrollo:

Transiciones de página: fade + translateY(8px), 200ms ease-out
Task card hover: translateY(-3px), 180ms ease-out
Drag and drop: rotación 2deg + sombra elevada en card
Modal/drawer entrada: translateX(100%)→translateX(0), 
                      250ms cubic-bezier(0.16, 1, 0.3, 1)
Contadores dashboard: count-up animado al entrar en viewport
Timer pulso: opacity 1→0.85 loop cada 1000ms cuando activo
Kanban column highlight: border opacity 0→1, 150ms ease
Toast entrada: translateX(120%)→translateX(0), 200ms ease-out
Botón loading: spinner SVG 16px reemplaza el label, 
               sin cambio de tamaño del botón
Checkbox completar tarea: checkmark con stroke-dashoffset 
                          animation, 200ms

════════════════════════════════════
ÍCONOS
════════════════════════════════════
Librería: Lucide Icons
Tamaño estándar: 18px en UI, 16px en labels, 24px decorativo
Stroke width: 1.5 (consistente en toda la app)
Color: heredado del texto del contexto

════════════════════════════════════
ASSETS A PREPARAR EN FIGMA
════════════════════════════════════
- Logo "TimeFlow": wordmark en Instrument Serif + 
  símbolo abstracto (reloj minimalista, solo manecillas 
  sin círculo) — versión oscura y clara
- Favicon: símbolo solo, 32×32
- Grain texture overlay: SVG noise pattern, para 
  la landing únicamente
- Estados vacíos: 2-3 ilustraciones SVG geométricas 
  (solo líneas y formas básicas, sin color plano masivo)
- App icon: para PWA, 512×512

════════════════════════════════════
ORGANIZACIÓN EN FIGMA
════════════════════════════════════
Pages del archivo Figma:
  📐 _Cover (thumbnail del proyecto)
  🎨 Design System (tokens, componentes, tipografía)
  📱 01 · Landing & Auth
  📱 02 · Onboarding
  📱 03 · Dashboard principal
  📱 04 · Kanban Board
  📱 05 · Vista semanal
  📱 06 · Analytics
  📱 07 · Configuración
  📱 08 · Estados vacíos & Errores
  🔴 Prototype flows (conexiones de navegación)

Frames desktop: 1440 × 900px
Frames mobile reference: 390 × 844px (solo para 
  referencia responsiva, no es prioridad MVP)