import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Quotes = lazy(() => import('@/pages/quotes/QuotesPage').then(m => ({ default: m.QuotesPage })));
const QuoteCreate = lazy(() => import('@/pages/quotes/QuoteCreate').then(m => ({ default: m.QuoteCreate })));
const QuoteDetails = lazy(() => import('@/pages/quotes/QuoteDetails').then(m => ({ default: m.QuoteDetails })));

/**
 * Routes pour la gestion des devis
 */
export const quotesRoutes: RouteObject[] = [
    {
        path: '/quotes',
        element: <Quotes />,
    },
    {
        path: '/quotes/new',
        element: <QuoteCreate />,
    },
    {
        path: '/quotes/:id',
        element: <QuoteDetails />,
    },
    {
        path: '/quotes/:id/edit',
        element: <QuoteCreate />,
    },
];
