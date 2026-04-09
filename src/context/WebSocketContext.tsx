import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useOperationalCompany } from '@/hooks/useOperationalCompany';
import { getApiBaseUrl } from '@/lib/api-config';

const API_URL = getApiBaseUrl();

// Types d'événements WebSocket
export type WebSocketEvent = 
    // Clients
    | 'client:created' 
    | 'client:updated' 
    | 'client:deleted'
    // Factures
    | 'invoice:created' 
    | 'invoice:updated' 
    | 'invoice:deleted'
    | 'invoice:status_changed'
    // Devis
    | 'quote:created' 
    | 'quote:updated' 
    | 'quote:deleted'
    | 'quote:status_changed'
    | 'quote:signed'
    // Produits
    | 'product:created' 
    | 'product:updated' 
    | 'product:deleted'
    // Paiements
    | 'payment:created' 
    | 'payment:deleted'
    // Catégories
    | 'category:created' 
    | 'category:updated' 
    | 'category:deleted'
    // Entreprises
    | 'company:created'
    | 'company:updated'
    | 'company:deleted';

type EventCallback = (data: any) => void;

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (event: WebSocketEvent, callback: EventCallback) => () => void;
    unsubscribe: (event: WebSocketEvent, callback: EventCallback) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { operationalCompany } = useOperationalCompany();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const listenersRef = useRef<Map<WebSocketEvent, Set<EventCallback>>>(new Map());
    const currentCompanyIdRef = useRef<string | null>(null);

    // Connexion au WebSocket - ne dépend que de user?.id pour éviter les reconnexions inutiles
    useEffect(() => {
        if (!user?.id) {
            // Déconnecter si pas d'utilisateur
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Ne pas recréer la connexion si elle existe déjà
        if (socketRef.current?.connected) {
            return;
        }

        // Créer la connexion WebSocket
        const socket = io(API_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WebSocket connecté');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket déconnecté');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Erreur de connexion WebSocket:', error);
        });

        // Cleanup
        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [user?.id]); // Dépend seulement de user.id, pas de l'objet user entier

    // Rejoindre la room de l'entreprise quand elle change
    useEffect(() => {
        if (!socketRef.current || !isConnected || !operationalCompany?.id || !user?.id) return;

        // Ne pas rejoindre si on est déjà dans cette room
        if (currentCompanyIdRef.current === operationalCompany.id) {
            return;
        }

        // Quitter l'ancienne room si nécessaire
        if (currentCompanyIdRef.current) {
            socketRef.current.emit('leaveCompany');
        }

        // Rejoindre la nouvelle room
        socketRef.current.emit('joinCompany', {
            companyId: operationalCompany.id,
            userId: user.id,
        });

        currentCompanyIdRef.current = operationalCompany.id;
        console.log(`Rejoint la room company:${operationalCompany.id}`);

        return () => {
            // Ne quitter que si le composant est vraiment démonté
            // (pas juste un re-render)
        };
    }, [operationalCompany?.id, user?.id, isConnected]);

    // Configurer les listeners d'événements
    useEffect(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        // Liste de tous les événements possibles
        const allEvents: WebSocketEvent[] = [
            'client:created', 'client:updated', 'client:deleted',
            'invoice:created', 'invoice:updated', 'invoice:deleted', 'invoice:status_changed',
            'quote:created', 'quote:updated', 'quote:deleted', 'quote:status_changed', 'quote:signed',
            'product:created', 'product:updated', 'product:deleted',
            'payment:created', 'payment:deleted',
            'category:created', 'category:updated', 'category:deleted',
            'company:created', 'company:updated', 'company:deleted',
        ];

        // Créer un handler pour chaque type d'événement
        allEvents.forEach(eventType => {
            socket.on(eventType, (data: any) => {
                const callbacks = listenersRef.current.get(eventType);
                if (callbacks) {
                    callbacks.forEach(callback => callback(data));
                }
            });
        });

        return () => {
            allEvents.forEach(eventType => {
                socket.off(eventType);
            });
        };
    }, [isConnected]);

    // S'abonner à un événement
    const subscribe = useCallback((event: WebSocketEvent, callback: EventCallback): (() => void) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, new Set());
        }
        listenersRef.current.get(event)!.add(callback);

        // Retourner une fonction de désabonnement
        return () => {
            listenersRef.current.get(event)?.delete(callback);
        };
    }, []);

    // Se désabonner d'un événement
    const unsubscribe = useCallback((event: WebSocketEvent, callback: EventCallback) => {
        listenersRef.current.get(event)?.delete(callback);
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, unsubscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

// Hook pour utiliser le context WebSocket
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}

// Hook pour s'abonner facilement à des événements WebSocket
export function useWebSocketEvent<T = any>(
    event: WebSocketEvent | WebSocketEvent[],
    callback: (data: T) => void,
    _deps: React.DependencyList = []
) {
    const { subscribe } = useWebSocket();
    
    // Utiliser une ref pour le callback pour éviter les re-abonnements
    const callbackRef = useRef(callback);
    
    // Mettre à jour la ref quand le callback change
    useEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        const events = Array.isArray(event) ? event : [event];
        
        // Wrapper stable qui utilise toujours le dernier callback
        const stableCallback = (data: T) => {
            callbackRef.current(data);
        };
        
        const unsubscribers = events.map(e => subscribe(e, stableCallback));

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subscribe, ...(Array.isArray(event) ? event : [event])]);
}
