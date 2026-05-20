import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { getAccessToken, clearAccessToken } from '../../api/http';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../../api/auth';
import { createTask as createTaskRequest, getTasks, updateTask as updateTaskRequest } from '../../api/tasks';
import { updateCurrentUser } from '../../api/users';
import { createTag as createTagRequest, deleteTag as deleteTagRequest, getTags } from '../../api/tags';
import {
  getActiveSession,
  getSessions,
  startSession as startSessionRequest,
  stopSession as stopSessionRequest,
} from '../../api/sessions';
import { mapBackendTask, mapTasksWithSessions, taskToCreatePayload, taskUpdatesToPayload } from '../../api/mappers';
import type { Colors, Page, Tag, Task, TimerState, User } from './types';
import { darkColors, lightColors } from './types';
import { allTags, initialTasks } from './mockData';

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
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

  const colors = darkMode ? darkColors : lightColors;

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

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const setIsAuthenticated = useCallback((value: boolean) => {
    if (!value) {
      clearAccessToken();
      setCurrentUser(null);
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
  }, []);

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
      const previousTasks = tasks;
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

      if (!getAccessToken()) return;

      try {
        const updated = await updateTaskRequest(id, taskUpdatesToPayload(updates));
        const backendSessions = await getSessions();
        setTasks(prev => prev.map(task => (task.id === id ? mapBackendTask(updated, backendSessions) : task)));
      } catch (error) {
        console.error(error);
        setTasks(previousTasks);
        toast.error('No se pudo actualizar la tarea');
      }
    },
    [tasks],
  );

  const addTask = useCallback(async (task: Task) => {
    if (!getAccessToken()) {
      setTasks(prev => [...prev, task]);
      return;
    }

    try {
      const created = await createTaskRequest(taskToCreatePayload(task));
      setTasks(prev => [...prev, mapBackendTask(created)]);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo crear la tarea');
    }
  }, []);

  const startTimer = useCallback(
    async (taskId: string) => {
      if (!getAccessToken()) {
        setTimerState({ ...EMPTY_TIMER, isActive: true, activeTaskId: taskId });
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
        await refreshTasks();
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
  }, [refreshTasks, timerState]);

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
    setTasks(initialTasks);
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
    if (!getAccessToken()) {
      setTags(prev => [...prev, { id: `custom-${Date.now()}`, name, color }]);
      return;
    }

    try {
      const tag = await createTagRequest({ name, colorHex: color });
      setTags(prev => [...prev, { id: tag.id, name: tag.name, color: tag.colorHex }]);
      toast.success('Tag creado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo crear el tag');
    }
  }, []);

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

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        tasks,
        setTasks,
        updateTask,
        addTask,
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
