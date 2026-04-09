import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { CompanyWithRole } from '@/types';
import { useCompany } from './useCompany';

const ACCOUNTANT_ROLES = new Set(['accountant', 'accountant_consultant']);
const CABINET_MANAGED_ROUTE_PATTERNS = [
    /^\/accountant(?:\/|$)/,
    /^\/quotes(?:\/|$)/,
    /^\/invoices(?:\/|$)/,
    /^\/credit-notes(?:\/|$)/,
    /^\/clients(?:\/|$)/,
    /^\/products(?:\/|$)/,
];
const SHARED_BUSINESS_ROUTE_PATTERNS = CABINET_MANAGED_ROUTE_PATTERNS.filter(
    (pattern) => pattern.source !== '^\\/accountant(?:\\/|$)',
);

function isAccountantMembership(company: CompanyWithRole | null | undefined): company is CompanyWithRole {
    return Boolean(company && ACCOUNTANT_ROLES.has(company.role));
}

function isCabinetCompany(company: CompanyWithRole | null | undefined): company is CompanyWithRole {
    return Boolean(company && company.company_owner_role === 'accountant');
}

function matchesRoute(pathname: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(pathname));
}

function resolveCabinetCompany(
    companies: CompanyWithRole[],
    selectedCompany: CompanyWithRole | null,
): CompanyWithRole | null {
    if (
        selectedCompany?.company_owner_role === 'accountant'
        && ACCOUNTANT_ROLES.has(selectedCompany.role)
    ) {
        return selectedCompany;
    }

    const linkedAccountantCompanyId = selectedCompany?.accountant_company_id ?? null;
    const linkedCabinet = linkedAccountantCompanyId
        ? companies.find((company) => company.id === linkedAccountantCompanyId && isCabinetCompany(company))
        : null;

    if (linkedCabinet) {
        return linkedCabinet;
    }

    return (
        companies.find((company) =>
            company.is_default
            && isCabinetCompany(company)
            && isAccountantMembership(company),
        )
        || companies.find((company) =>
            isCabinetCompany(company) && isAccountantMembership(company),
        )
        || companies.find((company) => isCabinetCompany(company))
        || companies.find((company) => isAccountantMembership(company))
        || null
    );
}

export function useOperationalCompany() {
    const location = useLocation();
    const companyContext = useCompany();
    const { companies, currentCompany: selectedCompany } = companyContext;

    const cabinetCompany = useMemo(
        () => resolveCabinetCompany(companies, selectedCompany),
        [companies, selectedCompany],
    );
    const isCabinetManagedRoute = useMemo(
        () => matchesRoute(location.pathname, CABINET_MANAGED_ROUTE_PATTERNS),
        [location.pathname],
    );
    const isSharedBusinessRoute = useMemo(
        () => matchesRoute(location.pathname, SHARED_BUSINESS_ROUTE_PATTERNS),
        [location.pathname],
    );

    const operationalCompany = useMemo(() => {
        if (cabinetCompany && isCabinetManagedRoute) {
            return cabinetCompany;
        }

        if (!selectedCompany) {
            return cabinetCompany;
        }

        return selectedCompany;
    }, [cabinetCompany, isCabinetManagedRoute, selectedCompany]);

    return {
        ...companyContext,
        selectedCompany,
        cabinetCompany,
        operationalCompany,
        shouldPromoteCabinetSelection:
            Boolean(isSharedBusinessRoute && selectedCompany && cabinetCompany && selectedCompany.id !== cabinetCompany.id),
        isUsingCabinetOperationalContext:
            Boolean(operationalCompany && selectedCompany && operationalCompany.id !== selectedCompany.id),
    };
}
