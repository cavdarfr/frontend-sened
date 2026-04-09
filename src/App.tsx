import { useRoutes } from 'react-router-dom';
import { publicRoutes, protectedRoutes, subscribeRoute, redirectRoutes } from './routes';
import { quotesRoutes } from './routes/quotes.routes';
import { invoicesRoutes } from './routes/invoices.routes';
import { creditNotesRoutes } from './routes/credit-notes.routes';
import { companiesRoutes } from './routes/companies.routes';
import { clientsRoutes } from './routes/clients.routes';
import { productsRoutes } from './routes/products.routes';
import { settingsRoutes } from './routes/settings.routes';
import { supportRoutes } from './routes/support.routes';
import { accountantRoutes } from './routes/accountant.routes';
import { superadminRoutes } from './routes/superadmin.routes';

/**
 * Application principale avec configuration des routes modulaire
 */
function App() {
    // Fusionne les routes enfants dans la route protégée
    const protectedRoutesWithChildren = {
        ...protectedRoutes,
        children: [
            ...(protectedRoutes.children || []),
            ...quotesRoutes,
            ...invoicesRoutes,
            ...creditNotesRoutes,
            ...companiesRoutes,
            ...clientsRoutes,
            ...productsRoutes,
            ...settingsRoutes,
            ...supportRoutes,
            ...accountantRoutes,
            ...superadminRoutes,
        ]
    };

    const element = useRoutes([
        ...publicRoutes,
        subscribeRoute,
        protectedRoutesWithChildren,
        ...redirectRoutes
    ]);

    return element;
}

export default App;
