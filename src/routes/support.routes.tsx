import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Support = lazy(() => import('@/pages/support/SupportPage').then(m => ({ default: m.SupportPage })));
const SupportArticle = lazy(() => import('@/pages/support/SupportArticlePage').then(m => ({ default: m.SupportArticlePage })));

/**
 * Routes pour le support
 */
export const supportRoutes: RouteObject[] = [
    {
        path: '/support',
        element: <Support />,
    },
    {
        path: '/support/:slug',
        element: <SupportArticle />,
    },
];
