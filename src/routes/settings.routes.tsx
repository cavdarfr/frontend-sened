import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Settings = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ReminderSettings = lazy(() => import('@/pages/settings/ReminderSettingsPage').then(m => ({ default: m.ReminderSettingsPage })));
const LegalDocuments = lazy(() => import('@/pages/settings/LegalDocumentsPage').then(m => ({ default: m.LegalDocumentsPage })));

export const settingsRoutes: RouteObject[] = [
    {
        path: '/settings',
        element: <Settings />,
    },
    {
        path: '/settings/reminders',
        element: <ReminderSettings />,
    },
    {
        path: '/settings/legal-documents',
        element: <LegalDocuments />,
    },
];
