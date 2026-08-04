import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './Guards';
import { LoadingScreen } from '../../shared/components/Loading';

const page = (factory: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  );
};

const router = createBrowserRouter([
  { path: '/login', element: page(() => import('../../features/auth/LoginPage')) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: page(() => import('../../features/dashboard/DashboardPage')) },
          { path: '/projects', element: page(() => import('../../features/projects/ProjectsPage')) },
          { path: '/projects/:id', element: page(() => import('../../features/projects/ProjectHierarchyPage')) },
          { path: '/clients', element: page(() => import('../../features/clients/ClientsPage')) },
          { path: '/factories', element: page(() => import('../../features/factories/FactoriesPage')) },
          { path: '/samples', element: page(() => import('../../features/samples/SamplesPage')) },
          { path: '/molds', element: page(() => import('../../features/samples/MoldsPage')) },
          { path: '/samples/:id', element: page(() => import('../../features/samples/SampleDetailPage')) },
          { path: '/sample-types', element: page(() => import('../../features/sample-types/SampleTypesPage')) },
          { path: '/requests', element: page(() => import('../../features/requests/RequestsPage')) },
          { path: '/tests', element: page(() => import('../../features/tests/TestsPage')) },
          { path: '/test-types', element: page(() => import('../../features/tests/TestTypesPage')) },
          { path: '/quality', element: page(() => import('../../features/quality/QualityPage')) },
          { path: '/reports', element: page(() => import('../../features/reports/ReportsPage')) },
          { path: '/reports/:id', element: page(() => import('../../features/reports/ReportDetailPage')) },
          { path: '/equipment', element: page(() => import('../../features/equipment/EquipmentPage')) },
          { path: '/maintenance', element: page(() => import('../../features/equipment/MaintenancePage')) },
          { path: '/curing', element: page(() => import('../../features/curing/CuringPage')) },
          { path: '/notifications', element: page(() => import('../../features/notifications/NotificationsPage')) },
          { path: '/files', element: page(() => import('../../features/files/FilesPage')) },
          { path: '/users', element: page(() => import('../../features/users/UsersPage')) },
          { path: '/settings', element: page(() => import('../../features/settings/SettingsPage')) },
          { path: '/profile', element: page(() => import('../../features/profile/ProfilePage')) },
          { path: '/activity', element: page(() => import('../../features/activity/ActivityPage')) },
          { path: '/analytics', element: page(() => import('../../features/analytics/AnalyticsPage')) },
          { path: '/calendar', element: page(() => import('../../features/calendar/CalendarPage')) },
          { path: '*', element: page(() => import('../../features/errors/NotFoundPage')) },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}