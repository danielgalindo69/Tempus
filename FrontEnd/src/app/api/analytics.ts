import { apiRequest } from './http';

export interface AnalyticsSummary {
  totalTasksPlanned: number;
  totalTasksCompleted: number;
  totalTimeSeconds: number;
  totalEstimatedSeconds: number;
  averageCompletionRate: number;
  daysTracked: number;
}

export interface CategoryDistribution {
  grandTotalSeconds: number;
  distribution: {
    categoryId: string;
    name: string;
    colorHex: string;
    totalSeconds: number;
    percentage: number;
    type: 'system' | 'user';
  }[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  treeStage: string;
  treeHealth: number;
}

export async function getAnalyticsSummary(from: string, to: string): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>('/analytics/summary', {
    query: { from, to },
  });
}

export async function getCategoryDistribution(from: string, to: string): Promise<CategoryDistribution> {
  return apiRequest<CategoryDistribution>('/analytics/categories', {
    query: { from, to },
  });
}

export async function getStreakInfo(): Promise<StreakInfo> {
  return apiRequest<StreakInfo>('/analytics/streak');
}
