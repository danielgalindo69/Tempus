import { Toaster } from 'sonner';
import { AppProvider, useApp } from './components/timeflow/AppContext';
import { Layout } from './components/timeflow/Layout';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { WeeklyPage } from './pages/WeeklyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmptyStatePage } from './pages/EmptyStatePage';

function AppInner() {
  const { currentPage, darkMode, navigate } = useApp();

  const authPages = currentPage === 'landing' || currentPage === 'onboarding';

  const pageWithNewTask = currentPage === 'dashboard' || currentPage === 'kanban';

  const handleNewTask = () => {
    if (currentPage !== 'kanban') navigate('kanban');
  };

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {authPages ? (
        <>
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'onboarding' && <OnboardingPage />}
        </>
      ) : (
        <Layout onNewTask={pageWithNewTask ? handleNewTask : undefined}>
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'kanban' && <KanbanPage />}
          {currentPage === 'weekly' && <WeeklyPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'empty' && <EmptyStatePage />}
        </Layout>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            backgroundColor: 'var(--tf-bg-card)',
            border: `1px solid var(--tf-bg-divider)`,
            color: 'var(--tf-text-primary)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            borderRadius: 10,
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
