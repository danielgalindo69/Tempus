import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { getAccessToken, clearAccessToken, isSessionExpired, markSessionActivity } from '../../api/http';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../../api/auth';
import {
  createTask as createTaskRequest,
  getTasks,
  updateTask as updateTaskRequest,
  updateTaskStatus as updateTaskStatusRequest,
  deleteTask as deleteTaskRequest,
} from '../../api/tasks';
import { updateCurrentUser } from '../../api/users';
import { createTag as createTagRequest, deleteTag as deleteTagRequest, getTags } from '../../api/tags';
import {
  getActiveSession,
  getSessions,
  startSession as startSessionRequest,
  stopSession as stopSessionRequest,
} from '../../api/sessions';
import { getNotifications, markNotificationsAsRead, type BackendNotification } from '../../api/notifications';
import { mapBackendTask, mapTasksWithSessions, taskToCreatePayload, taskUpdatesToPayload } from '../../api/mappers';
import type { Colors, Page, Tag, Task, TimerState, User } from './types';
import { darkColors, lightColors } from './types';
import { allTags } from './mockData';

function calculateNextOccurrence(afterDateStr: string, repeatDays: string, recurrenceEnd: string | null): string | null {
  const daysOfWeek = repeatDays.split(',').map(s => parseInt(s, 10));
  if (daysOfWeek.length === 0) return null;

  const [year, month, day] = afterDateStr.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  
  for (let i = 1; i <= 366; i++) {
    const nextDate = new Date(current);
    nextDate.setDate(current.getDate() + i);
    const dayOfWeek = nextDate.getDay();
    if (daysOfWeek.includes(dayOfWeek)) {
      const yearStr = nextDate.getFullYear();
      const monthStr = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dateStr = String(nextDate.getDate()).padStart(2, '0');
      const nextDateKey = `${yearStr}-${monthStr}-${dateStr}`;
      
      if (recurrenceEnd && nextDateKey > recurrenceEnd) {
        return null;
      }
      return nextDateKey;
    }
  }
  return null;
}

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  timerState: TimerState;
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  toggleTimerPause: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: Colors;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  currentUser: User | null;
  userName: string;
  setUserName: (v: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name?: string; timezone?: string; avatarUrl?: string | null }) => Promise<void>;
  refreshTasks: () => Promise<void>;
  tags: Tag[];
  refreshTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  isBootstrapping: boolean;
  isSyncing: boolean;
  // Modal global de nueva tarea
  isGlobalAddTaskOpen: boolean;
  openGlobalAddTask: () => void;
  closeGlobalAddTask: () => void;
  // Notificaciones
  notifications: BackendNotification[];
  unreadCount: number;
  isNotificationPanelOpen: boolean;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const EMPTY_TIMER: TimerState = {
  isActive: false,
  isPaused: false,
  seconds: 0,
  activeTaskId: null,
  activeSessionId: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticatedState] = useState(Boolean(getAccessToken()));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Alejandro');
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>(EMPTY_TIMER);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAddingTaskRef = useRef(false);
  const tasksRef = useRef<Task[]>([]);
  // Modal global de nueva tarea
  const [isGlobalAddTaskOpen, setIsGlobalAddTaskOpen] = useState(false);
  // Panel de notificaciones
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const colors = darkMode ? darkColors : lightColors;

  const expireSession = useCallback(() => {
    clearAccessToken();
    setIsAuthenticatedState(false);
    setCurrentUser(null);
    setTasks([]);
    setTags(allTags);
    setTimerState(EMPTY_TIMER);
    setCurrentPage('landing');
  }, []);

  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.isActive, timerState.isPaused]);

  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) return;

    const handleActivity = () => {
      markSessionActivity();
    };

    const handleTimeout = () => {
      if (isSessionExpired()) {
        expireSession();
        toast.info('Sesion cerrada por inactividad');
      }
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(eventName => window.addEventListener(eventName, handleActivity, { passive: true }));
    const timeoutInterval = window.setInterval(handleTimeout, 60 * 1000);

    return () => {
      events.forEach(eventName => window.removeEventListener(eventName, handleActivity));
      window.clearInterval(timeoutInterval);
    };
  }, [expireSession, isAuthenticated]);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const setIsAuthenticated = useCallback((value: boolean) => {
    if (!value) {
      clearAccessToken();
      setCurrentUser(null);
      setTasks([]);
      setTags(allTags);
    }
    setIsAuthenticatedState(value);
  }, []);



  const applyUser = useCallback((user: {
    id: string;
    name: string;
    email: string;
    timezone: string;
    avatarUrl: string | null;
  }) => {
    const initials = user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();

    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      avatar: initials || user.email.slice(0, 2).toUpperCase(),
    });
    setUserName(user.name);
  }, []);

  const refreshTags = useCallback(async () => {
    if (!getAccessToken()) {
      setTags(allTags);
      return;
    }

    try {
      const backendTags = await getTags();
      setTags(
        backendTags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.colorHex,
        })),
      );
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los tags');
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const result = await getNotifications({ limit: 20 });
      setNotifications(result.data);
      setUnreadCount(result.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    if (!getAccessToken()) return;

    setIsSyncing(true);
    try {
      const [backendTasks, backendSessions, activeSession, backendTags] = await Promise.all([
        getTasks(),
        getSessions(),
        getActiveSession(),
        getTags(),
      ]);

      setTags(
        backendTags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.colorHex,
        })),
      );
      setTasks(mapTasksWithSessions(backendTasks, backendSessions));
      await refreshNotifications();

      if (activeSession) {
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000),
        );
        setTimerState({
          isActive: true,
          isPaused: false,
          seconds: elapsed,
          activeTaskId: activeSession.taskId,
          activeSessionId: activeSession.id,
        });
      } else {
        setTimerState(prev => (prev.isActive ? EMPTY_TIMER : prev));
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar tus datos');
    } finally {
      setIsSyncing(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      if (!getAccessToken()) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (cancelled) return;

        applyUser(user);
        setIsAuthenticatedState(true);
        await refreshTasks();
        if (!cancelled) setCurrentPage('dashboard');
      } catch (error) {
        console.error(error);
        clearAccessToken();
        if (!cancelled) setIsAuthenticatedState(false);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, [applyUser, refreshTasks]);

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      // Snapshot previo para rollback (captura funcional evita stale closure)
      let previousTasks: Task[] = [];

      const task = tasksRef.current.find(t => t.id === id);
      if (task && task.recurrence && updates.status === 'done') {
        const completionDate = new Date().toISOString().split('T')[0];
        const nextOccurrenceDate = calculateNextOccurrence(completionDate, task.recurrence.repeatDays, task.recurrence.recurrenceEnd);

        if (nextOccurrenceDate) {
          // Optimistic: mostrar ambas tareas inmediatamente
          const optimisticCompleted: Task = {
            ...task,
            status: 'done',
            date: completionDate,
            recurrence: null,
            sessions: [],
          };

          const optimisticNext: Task = {
            ...task,
            date: nextOccurrenceDate,
            status: 'planned' as const,
            recurrence: {
              ...task.recurrence,
              recurrenceStart: nextOccurrenceDate,
            },
          };

          setTasks(prev => {
            previousTasks = prev;
            return [
              ...prev.filter(t => t.id !== id),
              optimisticNext,
            ];
          });

          if (!getAccessToken()) return;

          try {
            // 1. Crear tarea completada en BD con status done
            const completedPayload = taskToCreatePayload({ ...optimisticCompleted, id: `completed-${Date.now()}` });
            await createTaskRequest({ ...completedPayload, status: 'done' });

            // 2. Actualizar la tarea original con la siguiente fecha y status planned
            const updatedOriginal: Task = { ...optimisticNext };
            const payload = taskUpdatesToPayload(updatedOriginal);
            await updateTaskRequest(id, { ...payload, status: 'planned' });

            // 3. Refrescar completamente desde el backend para consistencia total
            await refreshTasks();
            toast.success('Ocurrencia de tarea completada');
          } catch (error) {
            console.error(error);
            setTasks(previousTasks);
            toast.error('No se pudo completar la tarea recurrente');
          }
          return;
        }
      }

      setTasks(prev => {
        previousTasks = prev;
        return prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      });

      if (!getAccessToken()) return;

      try {
        const payload = taskUpdatesToPayload(updates);
        const updated =
          updates.status !== undefined && Object.keys(updates).length === 1
            ? await updateTaskStatusRequest(id, payload.status!)
            : await updateTaskRequest(id, payload);
        const backendSessions = await getSessions();
        setTasks(prev => prev.map(task => (task.id === id ? mapBackendTask(updated, backendSessions) : task)));
      } catch (error) {
        console.error(error);
        setTasks(previousTasks);
        toast.error('No se pudo actualizar la tarea');
      }
    },
    [refreshTasks],
  );

  const addTask = useCallback(async (task: Task) => {
    // Guard contra double-submit
    if (isAddingTaskRef.current) return;
    isAddingTaskRef.current = true;

    if (!getAccessToken()) {
      setTasks(prev => [...prev, task]);
      isAddingTaskRef.current = false;
      return;
    }

    try {
      const created = await createTaskRequest(taskToCreatePayload(task));
      setTasks(prev => [...prev, mapBackendTask(created)]);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo crear la tarea');
    } finally {
      isAddingTaskRef.current = false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    let removedTask: Task | undefined;
    setTasks(prev => {
      removedTask = prev.find(t => t.id === id);
      return prev.filter(t => t.id !== id);
    });

    if (!getAccessToken()) return;

    try {
      await deleteTaskRequest(id);
      toast.success('Tarea eliminada');
    } catch (error) {
      console.error(error);
      // Rollback
      if (removedTask) {
        setTasks(prev => [...prev, removedTask!]);
      }
      toast.error('No se pudo eliminar la tarea');
    }
  }, []);

  const startTimer = useCallback(
    async (taskId: string) => {
      if (!getAccessToken()) {
        setTimerState({ ...EMPTY_TIMER, isActive: true, activeTaskId: taskId });
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'progress' } : t)));
        return;
      }

      try {
        const session = await startSessionRequest(taskId);
        setTimerState({
          isActive: true,
          isPaused: false,
          seconds: 0,
          activeTaskId: taskId,
          activeSessionId: session.id,
        });
        // Sincronizar optimísticamente y guardar en backend el estado 'progress'
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'progress' } : t)));
        await updateTaskRequest(taskId, { status: 'in_progress' });
        await refreshTasks();
      } catch (error) {
        console.error(error);
        toast.error('No se pudo iniciar el cronometro');
      }
    },
    [refreshTasks],
  );

  const stopTimer = useCallback(async () => {
    if (!timerState.activeTaskId) return;

    const minutes = Math.round(timerState.seconds / 60);
    const taskId = timerState.activeTaskId;

    if (getAccessToken() && timerState.activeSessionId) {
      try {
        await stopSessionRequest(timerState.activeSessionId);
        // Cambiar estado a 'done' usando la lógica unificada de updateTask (maneja recurrencia)
        await updateTask(taskId, { status: 'done' });
        toast.success('Sesion guardada');
      } catch (error) {
        console.error(error);
        toast.error('No se pudo guardar la sesion');
      }
      setTimerState(EMPTY_TIMER);
      return;
    }

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              actualTime: t.actualTime + minutes,
              status: 'done',
              sessions: [
                ...t.sessions,
                {
                  id: `s-${Date.now()}`,
                  taskId,
                  duration: minutes,
                  date: new Date().toISOString().split('T')[0],
                  label: `Sesion ${t.sessions.length + 1}`,
                },
              ],
            }
          : t,
      ),
    );

    const h = Math.floor(timerState.seconds / 3600);
    const m = Math.floor((timerState.seconds % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}min` : `${m}min`;
    toast.success(`Sesion guardada - ${timeStr}`);
    setTimerState(EMPTY_TIMER);
  }, [refreshTasks, timerState, updateTask]);

  const toggleTimerPause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest(email, password);
      applyUser(response.user);
      setIsAuthenticatedState(true);
      await refreshTasks();
      setCurrentPage('dashboard');
    },
    [applyUser, refreshTasks],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await registerRequest(name, email, password);
      applyUser(response.user);
      setIsAuthenticatedState(true);
      await refreshTasks();
      setCurrentPage('onboarding');
    },
    [applyUser, refreshTasks],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setIsAuthenticatedState(false);
    setCurrentUser(null);
    setTasks([]);
    setTags(allTags);
    setTimerState(EMPTY_TIMER);
    setCurrentPage('landing');
  }, []);

  const updateProfile = useCallback(
    async (payload: { name?: string; timezone?: string; avatarUrl?: string | null }) => {
      if (!getAccessToken()) {
        if (payload.name) setUserName(payload.name);
        return;
      }

      try {
        const user = await updateCurrentUser(payload);
        applyUser(user);
        toast.success('Perfil actualizado');
      } catch (error) {
        console.error(error);
        toast.error('No se pudo actualizar el perfil');
      }
    },
    [applyUser],
  );

  const createTag = useCallback(async (name: string, color: string) => {
    if (tags.length >= 20) {
      toast.error('Has alcanzado el límite máximo de 20 etiquetas.');
      return;
    }

    if (!getAccessToken()) {
      setTags(prev => [...prev, { id: `custom-${Date.now()}`, name, color }]);
      toast.success('Etiqueta creada');
      return;
    }

    try {
      const tag = await createTagRequest({ name, colorHex: color });
      setTags(prev => [...prev, { id: tag.id, name: tag.name, color: tag.colorHex }]);
      toast.success('Etiqueta creada');
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.message || 'No se pudo crear la etiqueta';
      toast.error(errMsg);
    }
  }, [tags]);

  const deleteTag = useCallback(async (id: string) => {
    if (!getAccessToken()) {
      setTags(prev => prev.filter(tag => tag.id !== id));
      return;
    }

    try {
      await deleteTagRequest(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
      await refreshTasks();
      toast.success('Tag eliminado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar el tag');
    }
  }, [refreshTasks]);

  const openGlobalAddTask = useCallback(() => setIsGlobalAddTaskOpen(true), []);
  const closeGlobalAddTask = useCallback(() => setIsGlobalAddTaskOpen(false), []);

  const openNotificationPanel = useCallback(async () => {
    setIsNotificationPanelOpen(true);
    await refreshNotifications();
  }, [refreshNotifications]);

  const closeNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(false);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      await markNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        tasks,
        setTasks,
        updateTask,
        addTask,
        deleteTask,
        timerState,
        startTimer,
        stopTimer,
        toggleTimerPause,
        darkMode,
        toggleDarkMode,
        colors,
        sidebarCollapsed,
        setSidebarCollapsed,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        userName,
        setUserName,
        login,
        register,
        logout,
        updateProfile,
        refreshTasks,
        tags,
        refreshTags,
        createTag,
        deleteTag,
        isBootstrapping,
        isSyncing,
        isGlobalAddTaskOpen,
        openGlobalAddTask,
        closeGlobalAddTask,
        notifications,
        unreadCount,
        isNotificationPanelOpen,
        openNotificationPanel,
        closeNotificationPanel,
        refreshNotifications,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
