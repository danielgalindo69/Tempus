import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Page, Task, TimerState, Colors } from './types';
import { darkColors, lightColors } from './types';
import { initialTasks } from './mockData';
import { toast } from 'sonner';

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  timerState: TimerState;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  toggleTimerPause: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: Colors;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  userName: string;
  setUserName: (v: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Alejandro');
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    seconds: 0,
    activeTaskId: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = darkMode ? darkColors : lightColors;

  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.isActive, timerState.isPaused]);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const startTimer = useCallback((taskId: string) => {
    setTimerState({ isActive: true, isPaused: false, seconds: 0, activeTaskId: taskId });
  }, []);

  const stopTimer = useCallback(() => {
    if (!timerState.activeTaskId) return;
    const minutes = Math.round(timerState.seconds / 60);
    const taskId = timerState.activeTaskId;
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
                  label: `Sesión ${t.sessions.length + 1}`,
                },
              ],
            }
          : t
      )
    );
    const h = Math.floor(timerState.seconds / 3600);
    const m = Math.floor((timerState.seconds % 3600) / 60);
    const timeStr = h > 0 ? `${h}h ${m}min` : `${m}min`;
    toast.success(`Sesión guardada — ${timeStr}`);
    setTimerState({ isActive: false, isPaused: false, seconds: 0, activeTaskId: null });
  }, [timerState]);

  const toggleTimerPause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
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
        userName,
        setUserName,
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
