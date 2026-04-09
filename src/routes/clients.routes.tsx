import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Clients = lazy(() => import('@/pages/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const ClientDetails = lazy(() => import('@/pages/clients/ClientDetails').then(m => ({ default: m.ClientDetails })));
const ClientCreate = lazy(() => import('@/pages/clients/ClientCreate').then(m => ({ default: m.ClientCreate })));

/**
 * Routes pour la gestion des clients
 */
export const clientsRoutes: RouteObject[] = [
    {
        path: '/clients',
        element: <Clients />,
    },
    {
        path: '/clients/new',
        element: <ClientCreate />,
    },
    {
        path: '/clients/:id',
        element: <ClientDetails />,
    },
    {
        path: '/clients/:id/edit',
        element: <ClientCreate />,
    },
];
