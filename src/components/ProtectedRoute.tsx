import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/context/SubscriptionContext';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Composant de route protégée
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 * Redirige vers /subscribe si l'utilisateur n'a pas d'abonnement actif
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { needsSubscription, canAccessApp, canManageBilling, loading: subLoading } = useSubscription();
    const location = useLocation();
    const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = useState(false);

    useEffect(() => {
        if (!authLoading && !subLoading) {
            setHasResolvedInitialLoad(true);
        }
    }, [authLoading, subLoading]);

    // Bloque seulement pendant le bootstrap initial pour éviter de démonter l'app
    // lors d'un refresh de session ou d'un rechargement d'abonnement en arrière-plan.
    if (!hasResolvedInitialLoad && (authLoading || subLoading)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    // Redirige vers login si non authentifié
    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Redirige vers /subscribe si pas d'abonnement actif
    // (sauf si déjà sur /subscribe ou /settings, ou retour de Stripe Checkout)
    const allowedWithoutSub = ['/subscribe', '/settings'];
    const isAllowed = allowedWithoutSub.some(p => location.pathname.startsWith(p));
    const searchParams = new URLSearchParams(location.search);
    const justSubscribed = searchParams.get('subscription') === 'success';
    if (!canAccessApp && needsSubscription && canManageBilling && !isAllowed && !justSubscribed) {
        return <Navigate to="/subscribe" replace />;
    }

    // Autorisé : affiche le contenu protégé
    return <>{children}</>;
}
