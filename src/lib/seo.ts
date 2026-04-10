import { matchPath } from 'react-router-dom';

export const SITE_NAME = 'Sened';

/** Description par défaut (landing / partage basique). */
export const DEFAULT_DESCRIPTION =
    'Sened — facturation, devis et suivi des paiements pour votre activité. Relances automatiques et interface moderne.';

/**
 * Titres courts pour l’onglet, sans suffixe marque (ajouté par formatDocumentTitle).
 * Ordre : chemins les plus spécifiques en premier.
 */
const ROUTE_TITLE_RULES: { pattern: string; title: string }[] = [
    { pattern: '/quotes/sign/:token/terms', title: 'Conditions du devis' },
    { pattern: '/quotes/sign/:token', title: 'Signature du devis' },
    { pattern: '/invoices/view/:token', title: 'Facture' },
    { pattern: '/auth/login', title: 'Connexion' },
    { pattern: '/auth/register', title: 'Créer un compte' },
    { pattern: '/auth/forgot-password', title: 'Mot de passe oublié' },
    { pattern: '/auth/reset-password', title: 'Nouveau mot de passe' },
    { pattern: '/subscribe', title: 'Abonnement' },
    { pattern: '/superadmin/quotes/:id', title: 'Devis (superadmin)' },
    { pattern: '/superadmin/invoices/:id', title: 'Facture (superadmin)' },
    { pattern: '/superadmin/credit-notes/:id', title: 'Avoir (superadmin)' },
    { pattern: '/superadmin/quotes', title: 'Devis (superadmin)' },
    { pattern: '/superadmin/invoices', title: 'Factures (superadmin)' },
    { pattern: '/superadmin/credit-notes', title: 'Avoirs (superadmin)' },
    { pattern: '/superadmin', title: 'Superadmin' },
    { pattern: '/settings/reminders', title: 'Relances' },
    { pattern: '/settings/legal-documents', title: 'Documents légaux' },
    { pattern: '/settings', title: 'Paramètres' },
    { pattern: '/invoices/:id/payment', title: 'Enregistrer un paiement' },
    { pattern: '/invoices/:id/edit', title: 'Modifier la facture' },
    { pattern: '/invoices/new', title: 'Nouvelle facture' },
    { pattern: '/invoices/:id', title: 'Facture' },
    { pattern: '/invoices', title: 'Factures' },
    { pattern: '/quotes/:id/edit', title: 'Modifier le devis' },
    { pattern: '/quotes/new', title: 'Nouveau devis' },
    { pattern: '/quotes/:id', title: 'Devis' },
    { pattern: '/quotes', title: 'Devis' },
    { pattern: '/credit-notes/:id', title: 'Avoir' },
    { pattern: '/credit-notes', title: 'Avoirs' },
    { pattern: '/clients/:id/edit', title: 'Modifier le client' },
    { pattern: '/clients/new', title: 'Nouveau client' },
    { pattern: '/clients/:id', title: 'Client' },
    { pattern: '/clients', title: 'Clients' },
    { pattern: '/products/new', title: 'Nouveau produit' },
    { pattern: '/products', title: 'Produits' },
    { pattern: '/companies/new', title: 'Nouvelle entreprise' },
    { pattern: '/companies/:id', title: 'Entreprise' },
    { pattern: '/companies', title: 'Entreprises' },
    { pattern: '/accountant/clients/:clientId', title: 'Client (comptable)' },
    { pattern: '/accountant', title: 'Espace comptable' },
    { pattern: '/support', title: "Centre d'aide" },
    { pattern: '/dashboard', title: 'Tableau de bord' },
    { pattern: '/', title: 'Facturation et suivi pour votre activité' },
];

/**
 * Segment de titre pour la route, ou `null` si une page enfant gère le titre (Helmet dynamique).
 */
export function getPageTitle(pathname: string): string | null {
    const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    if (normalized.startsWith('/legal/')) {
        return null;
    }

    const supportArticle = matchPath({ path: '/support/:slug', end: true }, normalized);
    if (supportArticle?.params.slug) {
        return null;
    }

    for (const { pattern, title } of ROUTE_TITLE_RULES) {
        if (matchPath({ path: pattern, end: true }, normalized)) {
            return title;
        }
    }

    return SITE_NAME;
}

export function formatDocumentTitle(pageTitle: string): string {
    return `${pageTitle} · ${SITE_NAME}`;
}
