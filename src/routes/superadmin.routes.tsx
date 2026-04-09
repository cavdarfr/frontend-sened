import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SuperadminDashboard = lazy(() => import('@/pages/superadmin/SuperadminDashboard').then(m => ({ default: m.SuperadminDashboard })));
const SuperadminQuotesPage = lazy(() => import('@/pages/superadmin/SuperadminQuotesPage').then(m => ({ default: m.SuperadminQuotesPage })));
const SuperadminQuoteDetailsPage = lazy(() => import('@/pages/superadmin/SuperadminQuoteDetailsPage').then(m => ({ default: m.SuperadminQuoteDetailsPage })));
const SuperadminInvoicesPage = lazy(() => import('@/pages/superadmin/SuperadminInvoicesPage').then(m => ({ default: m.SuperadminInvoicesPage })));
const SuperadminInvoiceDetailsPage = lazy(() => import('@/pages/superadmin/SuperadminInvoiceDetailsPage').then(m => ({ default: m.SuperadminInvoiceDetailsPage })));
const SuperadminCreditNotesPage = lazy(() => import('@/pages/superadmin/SuperadminCreditNotesPage').then(m => ({ default: m.SuperadminCreditNotesPage })));
const SuperadminCreditNoteDetailsPage = lazy(() => import('@/pages/superadmin/SuperadminCreditNoteDetailsPage').then(m => ({ default: m.SuperadminCreditNoteDetailsPage })));

export const superadminRoutes: RouteObject[] = [
    {
        path: '/superadmin',
        element: <SuperadminDashboard />,
    },
    {
        path: '/superadmin/quotes',
        element: <SuperadminQuotesPage />,
    },
    {
        path: '/superadmin/quotes/:id',
        element: <SuperadminQuoteDetailsPage />,
    },
    {
        path: '/superadmin/invoices',
        element: <SuperadminInvoicesPage />,
    },
    {
        path: '/superadmin/invoices/:id',
        element: <SuperadminInvoiceDetailsPage />,
    },
    {
        path: '/superadmin/credit-notes',
        element: <SuperadminCreditNotesPage />,
    },
    {
        path: '/superadmin/credit-notes/:id',
        element: <SuperadminCreditNoteDetailsPage />,
    },
];
