import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load des pages
const Products = lazy(() => import('@/pages/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductCreate = lazy(() => import('@/pages/products/ProductCreate').then(m => ({ default: m.ProductCreate })));

/**
 * Routes pour la gestion des produits
 */
export const productsRoutes: RouteObject[] = [
    {
        path: '/products',
        element: <Products />,
    },
    {
        path: '/products/new',
        element: <ProductCreate />,
    },
];
