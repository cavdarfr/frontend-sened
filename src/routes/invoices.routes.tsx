import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Invoices = lazy(() => import('@/pages/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const InvoiceCreate = lazy(() => import('@/pages/invoices/InvoiceCreate').then(m => ({ default: m.InvoiceCreate })));
const InvoiceDetails = lazy(() => import('@/pages/invoices/InvoiceDetails').then(m => ({ default: m.InvoiceDetails })));
const RecordPayment = lazy(() => import('@/pages/invoices/RecordPayment').then(m => ({ default: m.RecordPayment })));

/**
 * Routes pour la gestion des factures
 */
export const invoicesRoutes: RouteObject[] = [
    {
        path: '/invoices',
        element: <Invoices />,
    },
    {
        path: '/invoices/new',
        element: <InvoiceCreate />,
    },
    {
        path: '/invoices/:id',
        element: <InvoiceDetails />,
    },
    {
        path: '/invoices/:id/edit',
        element: <InvoiceCreate />,
    },
    {
        path: '/invoices/:id/payment',
        element: <RecordPayment />,
    },
];
