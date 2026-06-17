export type Page =
  | 'landing'
  | 'onboarding'
  | 'dashboard'
  | 'kanban'
  | 'calendar'
  | 'weekly'
  | 'analytics'
  | 'settings'
  | 'empty'
  | 'urgent';

export type TaskStatus = 'planned' | 'progress' | 'done';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TimeSession {
  id: string;
  taskId: string;
  duration: number;
  date: string;
  label: string;
}

export interface TaskRecurrence {
  id: string;
  sourceTaskId: string;
  repeatDays: string; // "1,3,5"
  recurrenceStart: string;
  recurrenceEnd: string | null;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  notes?: string;
  estimatedSeconds?: number;
  status: TaskStatus;
  tags: Tag[];
  estimatedTime: number;
  actualTime: number;
  date: string;
  sessions: TimeSession[];
  priority: 'low' | 'medium' | 'high';
  recurrence?: TaskRecurrence | null;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  seconds: number;
  activeTaskId: string | null;
  activeSessionId: string | null;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  timezone: string;
  avatar: string;
}

export interface Colors {
  bg: {
    page: string;
    panel: string;
    card: string;
    hover: string;
    divider: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  accent: {
    wine: string;
    carmine: string;
    terra: string;
    salmon: string;
  };
  state: {
    planned: string;
    progress: string;
    done: string;
  };
}

export const darkColors: Colors = {
  bg: {
    page: '#0D0D0D',
    panel: '#161614',
    card: '#1F1F1C',
    hover: '#2A2A26',
    divider: '#333330',
  },
  text: {
    primary: '#F5F0E8',
    secondary: '#A09E98',
    disabled: '#5C5C58',
  },
  accent: {
    wine: '#8B1A2F',
    carmine: '#A8263D',
    terra: '#C4614A',
    salmon: '#D4886E',
  },
  state: {
    planned: '#3B5A8A',
    progress: '#C4914A',
    done: '#3A7D5C',
  },
};

export const lightColors: Colors = {
  bg: {
    page: '#F5F0E8',
    panel: '#EDE8DF',
    card: '#FAF8F4',
    hover: '#E4DDD3',
    divider: '#C9C4BB',
  },
  text: {
    primary: '#0D0D0D',
    secondary: '#6B6965',
    disabled: '#A09E98',
  },
  accent: {
    wine: '#8B1A2F',
    carmine: '#A8263D',
    terra: '#C4614A',
    salmon: '#D4886E',
  },
  state: {
    planned: '#3B5A8A',
    progress: '#C4914A',
    done: '#3A7D5C',
  },
};
