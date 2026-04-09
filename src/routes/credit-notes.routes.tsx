import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const CreditNotes = lazy(() => import('@/pages/credit-notes/CreditNotesPage').then(m => ({ default: m.CreditNotesPage })));
const CreditNoteDetails = lazy(() => import('@/pages/credit-notes/CreditNoteDetails').then(m => ({ default: m.CreditNoteDetails })));

export const creditNotesRoutes: RouteObject[] = [
    {
        path: '/credit-notes',
        element: <CreditNotes />,
    },
    {
        path: '/credit-notes/:id',
        element: <CreditNoteDetails />,
    },
];
