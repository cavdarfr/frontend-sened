import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Variables d'environnement Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies dans le fichier .env'
    );
}

/**
 * Client Supabase configuré pour le frontend
 * Utilisé pour l'authentification et les requêtes directes
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Stockage local pour persister la session
        persistSession: true,
        // Détection automatique des changements de session
        autoRefreshToken: true,
        // Détection de l'URL de callback OAuth
        detectSessionInUrl: true,
    },
});

/**
 * Récupère le token JWT de l'utilisateur connecté
 * Utilisé pour les appels API vers le backend NestJS
 */
export const getAccessToken = async (): Promise<string | null> => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};

/**
 * Connexion avec email et mot de passe
 */
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};

export interface SignUpMetadata {
    full_name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    company_creation_mode?: 'create' | 'join_only';
    company_name?: string;
    siren?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    plan_slug?: string;
    team_size?: string;
    role?: 'merchant_admin' | 'merchant_consultant' | 'accountant' | 'accountant_consultant' | 'superadmin';
    accountant_siren?: string;
    platform_legal_accepted_at?: string;
}

export const signUpWithEmail = async (email: string, password: string, metadata: string | SignUpMetadata) => {
    const signUpMetadata: SignUpMetadata = typeof metadata === 'string' 
        ? { full_name: metadata } 
        : metadata;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: signUpMetadata,
        },
    });

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Déconnexion de l'utilisateur
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
};
