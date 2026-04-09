import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Companies = lazy(() => import('@/pages/companies/CompaniesPage').then(m => ({ default: m.CompaniesPage })));
const CompanyCreate = lazy(() => import('@/pages/companies/CompanyCreate').then(m => ({ default: m.CompanyCreate })));
const CompanyDetails = lazy(() => import('@/pages/companies/CompanyDetails').then(m => ({ default: m.CompanyDetails })));

/**
 * Routes pour la gestion des entreprises
 */
export const companiesRoutes: RouteObject[] = [
    {
        path: '/companies',
        element: <Companies />,
    },
    {
        path: '/companies/new',
        element: <CompanyCreate />,
    },
    {
        path: '/companies/:id',
        element: <CompanyDetails />,
    },
];
