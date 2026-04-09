import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const AccountantDashboard = lazy(() => import('@/pages/accountant/AccountantDashboard').then(m => ({ default: m.AccountantDashboard })));
const AccountantClientDetails = lazy(() => import('@/pages/accountant/AccountantClientDetails').then(m => ({ default: m.AccountantClientDetails })));

export const accountantRoutes: RouteObject[] = [
    {
        path: '/accountant',
        element: <AccountantDashboard />,
    },
    {
        path: '/accountant/clients/:clientId',
        element: <AccountantClientDetails />,
    },
];
