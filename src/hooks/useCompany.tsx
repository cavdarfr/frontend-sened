import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { companyService } from '@/services/api';
import type { CompanyWithRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface CompanyContextType {
    companies: CompanyWithRole[];
    currentCompany: CompanyWithRole | null;
    setCurrentCompany: (company: CompanyWithRole) => void;
    loading: boolean;
    hasResolved: boolean;
    loadError: Error | null;
    refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id ?? null;
    const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
    const [currentCompany, setCurrentCompanyState] = useState<CompanyWithRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasResolved, setHasResolved] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    const fetchCompanies = useCallback(async () => {
        if (authLoading) {
            setLoading(true);
            setHasResolved(false);
            return;
        }

        if (!userId) {
            setCompanies([]);
            setCurrentCompanyState(null);
            setLoadError(null);
            setLoading(false);
            setHasResolved(true);
            return;
        }

        try {
            setLoading(true);
            setHasResolved(false);
            setLoadError(null);
            const response = await companyService.getAll();
            setCompanies(response.companies);

            // Récupérer l'entreprise par défaut ou la première
            const savedCompanyId = localStorage.getItem('currentCompanyId');
            let defaultCompany = response.companies.find(c => c.id === savedCompanyId);
            
            if (!defaultCompany) {
                defaultCompany = response.companies.find(c => c.is_default) || response.companies[0];
            }

            if (defaultCompany) {
                setCurrentCompanyState(defaultCompany);
            } else {
                setCurrentCompanyState(null);
                localStorage.removeItem('currentCompanyId');
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setLoadError(error instanceof Error ? error : new Error('Erreur lors du chargement des entreprises'));
        } finally {
            setLoading(false);
            setHasResolved(true);
        }
    }, [authLoading, userId]);

    useEffect(() => {
        void fetchCompanies();
    }, [fetchCompanies]);

    const setCurrentCompany = (company: CompanyWithRole) => {
        setCurrentCompanyState(company);
        localStorage.setItem('currentCompanyId', company.id);
    };

    return (
        <CompanyContext.Provider
            value={{
                companies,
                currentCompany,
                setCurrentCompany,
                loading,
                hasResolved,
                loadError,
                refreshCompanies: fetchCompanies,
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
