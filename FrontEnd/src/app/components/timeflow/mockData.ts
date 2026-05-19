import type { Task, Tag, User } from './types';

export const allTags: Tag[] = [
  { id: 't1', name: 'Diseño', color: '#3B5A8A' },
  { id: 't2', name: 'Dev', color: '#3A7D5C' },
  { id: 't3', name: 'Research', color: '#C4914A' },
  { id: 't4', name: 'Reunión', color: '#8B1A2F' },
  { id: 't5', name: 'Admin', color: '#A09E98' },
  { id: 't6', name: 'UX', color: '#7B5EA7' },
];

export const mockUser: User = {
  name: 'Alejandro García',
  email: 'alejandro@timeflow.app',
  timezone: 'America/Mexico_City',
  avatar: 'AG',
};

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Diseñar sistema de componentes',
    description: 'Crear los tokens de diseño y los componentes base para el nuevo design system. Incluye tipografía, paleta de colores, iconografía y componentes primitivos.',
    status: 'planned',
    tags: [allTags[0], allTags[5]],
    estimatedTime: 120,
    actualTime: 0,
    date: '2026-05-19',
    priority: 'high',
    sessions: [],
  },
  {
    id: 'task-2',
    title: 'Implementar autenticación OAuth',
    description: 'Integrar Google OAuth y sistema de sesiones con JWT. Incluir refresh tokens y manejo de expiración.',
    status: 'progress',
    tags: [allTags[1]],
    estimatedTime: 180,
    actualTime: 95,
    date: '2026-05-19',
    priority: 'high',
    sessions: [
      { id: 's1', taskId: 'task-2', duration: 55, date: '2026-05-18', label: 'Sesión inicial' },
      { id: 's2', taskId: 'task-2', duration: 40, date: '2026-05-19', label: 'Continuación' },
    ],
  },
  {
    id: 'task-3',
    title: 'Reunión semanal de equipo',
    description: 'Revisión de sprints, planificación de próxima semana y retrospectiva.',
    status: 'done',
    tags: [allTags[3]],
    estimatedTime: 60,
    actualTime: 65,
    date: '2026-05-19',
    priority: 'medium',
    sessions: [
      { id: 's3', taskId: 'task-3', duration: 65, date: '2026-05-19', label: 'Reunión completa' },
    ],
  },
  {
    id: 'task-4',
    title: 'Investigar frameworks CSS modernos',
    description: 'Comparar Tailwind v4, UnoCSS y StyleX para el próximo proyecto. Evaluar DX, bundle size y mantenibilidad.',
    status: 'planned',
    tags: [allTags[2], allTags[1]],
    estimatedTime: 90,
    actualTime: 0,
    date: '2026-05-20',
    priority: 'medium',
    sessions: [],
  },
  {
    id: 'task-5',
    title: 'Refactorizar módulo de usuarios',
    description: 'Migrar el módulo de gestión de usuarios a la nueva arquitectura hexagonal. Actualizar tests unitarios.',
    status: 'progress',
    tags: [allTags[1]],
    estimatedTime: 240,
    actualTime: 110,
    date: '2026-05-20',
    priority: 'high',
    sessions: [
      { id: 's4', taskId: 'task-5', duration: 110, date: '2026-05-19', label: 'Migración core' },
    ],
  },
  {
    id: 'task-6',
    title: 'Crear documentación API REST',
    description: 'Documentar todos los endpoints en OpenAPI 3.0. Incluir ejemplos de request/response y esquemas de error.',
    status: 'done',
    tags: [allTags[1], allTags[4]],
    estimatedTime: 120,
    actualTime: 105,
    date: '2026-05-18',
    priority: 'medium',
    sessions: [
      { id: 's5', taskId: 'task-6', duration: 105, date: '2026-05-18', label: 'Documentación completa' },
    ],
  },
  {
    id: 'task-7',
    title: 'Revisar propuestas de diseño mobile',
    description: 'Evaluar las 3 propuestas del equipo de diseño para la versión mobile. Dar feedback detallado.',
    status: 'planned',
    tags: [allTags[0], allTags[5]],
    estimatedTime: 60,
    actualTime: 0,
    date: '2026-05-21',
    priority: 'low',
    sessions: [],
  },
  {
    id: 'task-8',
    title: 'Actualizar dependencias del proyecto',
    description: 'Revisar y actualizar todas las dependencias con vulnerabilidades de seguridad conocidas.',
    status: 'done',
    tags: [allTags[4]],
    estimatedTime: 30,
    actualTime: 25,
    date: '2026-05-17',
    priority: 'low',
    sessions: [
      { id: 's6', taskId: 'task-8', duration: 25, date: '2026-05-17', label: 'Actualización' },
    ],
  },
];

export const weeklyData = [
  { day: 'Lun', hours: 4.5, completed: 3 },
  { day: 'Mar', hours: 6.2, completed: 5 },
  { day: 'Mié', hours: 3.8, completed: 2 },
  { day: 'Jue', hours: 7.1, completed: 6 },
  { day: 'Vie', hours: 5.4, completed: 4 },
  { day: 'Sáb', hours: 0, completed: 0 },
  { day: 'Dom', hours: 0, completed: 0 },
];

export const completionTrend = [
  { week: 'Sem 1', rate: 68 },
  { week: 'Sem 2', rate: 72 },
  { week: 'Sem 3', rate: 65 },
  { week: 'Sem 4', rate: 81 },
  { week: 'Sem 5', rate: 78 },
  { week: 'Sem 6', rate: 85 },
  { week: 'Sem 7', rate: 88 },
];

export const timeByTag = [
  { name: 'Dev', value: 420, color: '#3A7D5C' },
  { name: 'Diseño', value: 180, color: '#3B5A8A' },
  { name: 'Research', value: 90, color: '#C4914A' },
  { name: 'Reunión', value: 130, color: '#8B1A2F' },
  { name: 'Admin', value: 55, color: '#A09E98' },
];

export const hourlyActivity = Array.from({ length: 7 }, (_, dayIdx) =>
  Array.from({ length: 24 }, (_, hour) => {
    if (dayIdx >= 5) return 0;
    if (hour < 8 || hour > 20) return 0;
    const base = Math.random();
    if (hour >= 9 && hour <= 11) return Math.min(1, base * 1.5);
    if (hour >= 14 && hour <= 17) return Math.min(1, base * 1.3);
    return base * 0.6;
  })
);
