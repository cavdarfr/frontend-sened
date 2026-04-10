import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { DEFAULT_DESCRIPTION, formatDocumentTitle, getPageTitle } from '@/lib/seo';

/**
 * Titre et meta description par défaut selon l’URL. Les routes exclues (légal, article support)
 * laissent le titre aux pages qui injectent un Helmet dynamique.
 */
export function RouteDocumentHead() {
    const { pathname } = useLocation();
    const segment = getPageTitle(pathname);

    if (segment === null) {
        return (
            <Helmet>
                <meta name="description" content={DEFAULT_DESCRIPTION} />
            </Helmet>
        );
    }

    return (
        <Helmet>
            <title>{formatDocumentTitle(segment)}</title>
            <meta name="description" content={DEFAULT_DESCRIPTION} />
        </Helmet>
    );
}
