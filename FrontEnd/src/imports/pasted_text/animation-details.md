════════════════════════════════════
LOGO — IDENTIDAD DE MARCA COMPLETA
════════════════════════════════════
Concepto del símbolo:
  Dos manecillas de reloj formando una "T" estilizada
  (T de TimeFlow). Sin círculo exterior — las manecillas
  solas, flotando. Trazo limpio, stroke-only, sin relleno.
  Grosor del trazo: 2px óptico. Extremos: redondeados
  (stroke-linecap: round). Ángulo: manecilla larga a las 12,
  manecilla corta a las 3 — formando ángulo recto perfecto.

Variantes del logo a construir:
  1. Wordmark completo horizontal:
     [símbolo 24px] + "TimeFlow" en Instrument Serif
     Kerning entre símbolo y texto: 10px
     Uso: header de sidebar expandida, landing page

  2. Wordmark compacto:
     "Time" en weight Regular + "Flow" en weight Regular
     pero "Flow" con color accent/wine — diferenciación
     cromática dentro de la misma palabra, mismo tamaño

  3. Símbolo solo (isotipo):
     Para favicon, app icon, sidebar colapsada
     Versiones: 16px / 32px / 64px / 512px
     A 16px y 32px: simplificar a un solo trazo en L

  4. Badge/stamp versión:
     Símbolo centrado en cuadrado con esquinas 20% radius
     Fondo accent/wine, símbolo en text/primary (#F5F0E8)
     Uso: notificaciones push, PWA icon

Reglas de uso del logo:
  - Espacio mínimo alrededor: igual al alto de la "T" del logo
  - Nunca estirar ni distorsionar proporcionalmente
  - Nunca sobre fondos con bajo contraste
  - Nunca aplicar sombras o efectos al logo
  - Sobre fondo claro: usar versión oscura (#0D0D0D)
  - Sobre fondo oscuro: usar versión marfil (#F5F0E8)
  - El accent/wine puede usarse como fondo del badge,
    nunca como color directo del wordmark principal

════════════════════════════════════
SISTEMA DE ANIMACIONES — DETALLE
════════════════════════════════════
Curvas de animación (definir como variables):
  ease-out-smooth:    cubic-bezier(0.16, 1, 0.3, 1)
    → entradas de modals, drawers, cards que aparecen
  ease-in-out-soft:   cubic-bezier(0.4, 0, 0.2, 1)
    → transiciones de estado, cambios de color
  spring-snappy:      cubic-bezier(0.34, 1.56, 0.64, 1)
    → drag and drop al soltar, confirmaciones de acción
    → tiene un pequeño overshoot (rebote sutil, NO bounce)
  ease-in-fast:       cubic-bezier(0.4, 0, 1, 1)
    → salidas de elementos (dismiss, close)

Duración estándar por tipo:
  Micro (hover, focus, color):    120–150ms
  Corta (aparecer, desaparecer):  180–220ms
  Media (modals, drawers):        240–280ms
  Larga (transiciones de página): 300–350ms
  NUNCA más de 400ms — se siente lento

Animaciones específicas adicionales:

  TASK CARD — completar tarea:
    1. Checkbox: stroke-dashoffset draw animation 200ms
    2. Título: text-decoration line-through aparece 150ms
    3. Card entera: opacity 1→0.5, translateX(8px), 300ms
    4. Card se mueve a columna "Terminado" con slide

  KANBAN — mover columna:
    Las demás cards hacen espacio con gap animation
    antes de que la card arrastrada llegue (predictive layout)

  CRONÓMETRO — iniciar sesión:
    1. Botón play: scale 1→0.9→1 en 200ms (press feel)
    2. Display: digits hacen flip de 00:00:00 al tiempo actual
    3. Dot indicador de "activo": pulse infinito
       scale 1→1.4→1, opacity 1→0→1, cada 2s,
       color accent/terra

  CRONÓMETRO — detener sesión:
    1. Display congela con flash sutil (opacity 1→0.6→1)
    2. Toast aparece: "Sesión guardada — 1h 24min"
    3. Task card se actualiza con nuevo tiempo acumulado

  DASHBOARD — carga inicial:
    Stat cards entran en secuencia (stagger 60ms entre cada una)
    Valores hacen count-up desde 0 al valor real, 600ms
    Gráficas: barras crecen desde 0 con ease-out-smooth, 500ms
    Todo esto solo en la primera carga de sesión,
    no en navegación entre páginas

  SIDEBAR — colapsar/expandir:
    Width 240px→64px con ease-in-out-soft, 250ms
    Labels de nav: fade out primero (100ms), luego colapsa
    Tooltips aparecen en hover cuando está colapsada

  NOTIFICACIÓN TOAST:
    Entrada: translateX(110%)→0, ease-out-smooth, 220ms
    Salida: translateX(110%), ease-in-fast, 180ms
    Barra de progreso: width 100%→0% linear en 4000ms
    Stack: cuando hay varios, se apilan con gap y escala

  EMPTY STATE:
    Ilustración SVG hace un draw animation (stroke-dashoffset)
    de los elementos geométricos, 600ms secuencial
    Texto y CTA entran después con fade + translateY(8px)

  LOADING SKELETON:
    Usar shimmer: fondo bg/slate con overlay bg/graphite
    moviendose de izquierda a derecha, 1.4s infinito
    NO usar spinners para carga de contenido de página
    Spinners solo para acciones puntuales (guardar, enviar)

════════════════════════════════════
MICROINTERACCIONES TÁCTILES
════════════════════════════════════
(Para cuando se implemente PWA / mobile)

Touch feedback en cards:
  Press: scale(0.98), 80ms — respuesta inmediata
  Release: scale(1), spring-snappy, 200ms

Swipe en task card (mobile):
  Swipe derecha: revelar "Completar" con fondo state/done
  Swipe izquierda: revelar "Eliminar" con fondo feedback/error
  Umbral de activación: 80px de swipe

Long press en card:
  Después de 400ms hold: entra en modo drag
  Feedback háptico si disponible
  Card escala a 1.04 con sombra elevada

════════════════════════════════════
GRID Y SISTEMA RESPONSIVO DETALLADO
════════════════════════════════════
Desktop 1440px:
  Sidebar: 240px fija
  Content area: fluid
  Max-width del contenido interior: 1120px
  Columns internas: 12 columnas, gutter 24px

Laptop 1024–1280px:
  Sidebar: colapsada por defecto (64px)
  Hover sobre sidebar: se expande temporalmente (overlay)
  Content area: fluid

Tablet 768–1024px:
  Sidebar: oculta, accesible por hamburger
  Kanban: scroll horizontal nativo entre columnas
  Timer widget: dock en bottom-center, no bottom-right

Mobile 375–768px (referencia futura):
  Bottom navigation: 5 ítems, 64px altura
  Kanban: una columna visible a la vez, swipe entre columnas
  Timer: siempre visible como sticky bottom bar

════════════════════════════════════
DARK / LIGHT MODE — REGLAS
════════════════════════════════════
El modo oscuro es el principal (default).
El modo claro es alternativo, mismo diseño pero:

Superficies en modo claro:
  bg/obsidian  → bg/ivory      (#F5F0E8)
  bg/carbon    → bg/cream      (#EDE8DF)
  bg/graphite  → bg/warm-white (#FAF8F4)
  bg/slate     → bg/parchment  (#E4DDD3)

Texto en modo claro:
  text/primary  → #0D0D0D
  text/secondary → #6B6965

Acento: accent/wine (#8B1A2F) se mantiene igual en ambos modos.
Es suficientemente oscuro para contrastar sobre marfil
y suficientemente saturado para destacar sobre negro.

Transición entre modos:
  Todas las superficies y textos transicionan con
  background-color 300ms ease-in-out-soft
  NO hacer flash — la transición debe ser suave

Guardar preferencia: en localStorage y en perfil de usuario.
Respetar prefers-color-scheme del sistema operativo
como valor inicial si el usuario no ha elegido.

════════════════════════════════════
ESTADOS DE COMPONENTES EXTENDIDOS
════════════════════════════════════
Definir en Figma para CADA componente interactivo:

  Default → Hover → Focus → Active → Disabled → Loading
  + estados de error donde aplique
  + estado "dragover" para zonas de drop

Focus ring (accesibilidad):
  Outline: 2px solid accent/carmine (#A8263D)
  Offset: 2px
  Border-radius: igual al del componente + 2px
  Visible SOLO con navegación por teclado (focus-visible)
  NUNCA ocultar el focus ring con outline: none sin reemplazo

════════════════════════════════════
ILUSTRACIONES — SISTEMA SVG
════════════════════════════════════
Estilo de ilustraciones para estados vacíos:

  Tipo: geometric line art — SOLO líneas y formas básicas
  Trazo: 1.5px stroke, redondeado, color bg/divider (#333330)
  Detalle de acento: una sola línea o forma en accent/wine
  Sin rellenos sólidos masivos
  Sin personajes, manos, caras, ni elementos humanos
  Sin perspectiva isométrica (se ve artificial)
  Composición: centrada, máximo 200×160px
  Ejemplos de metáforas aceptadas:
    - Tablero vacío: cuadrícula de líneas + un punto en wine
    - Sin datos: ejes vacíos con una línea que no llega
    - Éxito: checkmark minimalista con círculo incompleto

  Una ilustración de éxito (tarea completada, racha):
    Checkmark construido por dos trazos, sin círculo
    Color: state/done (#3A7D5C), stroke 2px

════════════════════════════════════
NOMENCLATURA Y ORGANIZACIÓN FIGMA
════════════════════════════════════
Convención de nombres para layers y componentes:

  Componentes:   PascalCase → TaskCard, TimerWidget
  Variantes:     Type=Primary, Size=MD, State=Hover
  Frames:        kebab-case → 04-kanban-board
  Grupos:        snake_case → timer_display_group
  Tokens:        color/bg/carbon, color/accent/wine
                 spacing/md, radius/card
                 font/display, font/body

Auto Layout en TODOS los componentes:
  Nunca usar posición absoluta dentro de componentes
  Siempre definir constraints para responsividad
  Usar variables de Figma para todos los colores y espaciados

Layers limpios:
  Sin layers "Rectangle 247" o "Group 12"
  Todo nombrado antes de entregar
  Componentes publicados en el Team Library del archivo

════════════════════════════════════
HANDOFF PARA DESARROLLO
════════════════════════════════════
Anotaciones requeridas en cada pantalla:

  - Especificar qué animaciones usa cada elemento
    (nombre de la curva y duración exacta)
  - Marcar qué componentes son de la librería
  - Anotar comportamiento responsive de cada sección
  - Documentar estados de carga y error de cada vista
  - Especificar z-index lógico (qué elemento va encima)
  - Marcar qué datos son dinámicos vs estáticos

Exportar desde Figma:
  - Design tokens como JSON (plugin Tokens Studio)
  - SVG optimizados para íconos custom e ilustraciones
  - Especificaciones CSS de tipografía y espaciado
  - Guía de componentes en formato PDF (una página por sección)