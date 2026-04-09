import { useMemo } from 'react';
import type { CompanyOwnerRole, CompanyRole } from '@/types';

const ROLE_LABELS: Record<CompanyRole, string> = {
    merchant_admin: 'Administrateur',
    merchant_consultant: 'Collaborateur',
    accountant: 'Expert-comptable',
    accountant_consultant: 'Collaborateur comptable',
    superadmin: 'Superadmin',
};

export function getRoleLabel(role: CompanyRole): string {
    return ROLE_LABELS[role] ?? role;
}

export interface Permissions {
    role: CompanyRole | null;

    isMerchantAdmin: boolean;
    isMerchantConsultant: boolean;
    isAccountant: boolean;
    isAccountantConsultant: boolean;
    isSuperAdmin: boolean;

    isMerchant: boolean;
    isAccountantSide: boolean;
    isCabinetContext: boolean;
    isMerchantContext: boolean;

    canCreateQuote: boolean;
    canEditQuote: boolean;
    canDeleteQuote: boolean;
    canSendQuote: boolean;

    canCreateInvoice: boolean;
    canEditInvoice: boolean;
    canDeleteInvoice: boolean;
    canSendInvoice: boolean;

    canCreateProduct: boolean;
    canEditProduct: boolean;
    canDeleteProduct: boolean;

    canCreateCreditNote: boolean;

    canCreateClient: boolean;
    canEditClient: boolean;
    canDeleteClient: boolean;

    canAccessSettings: boolean;
    canManageSubscription: boolean;
    canManageCompanySettings: boolean;
    canManageUsers: boolean;
    canDeleteCompany: boolean;
    canCreateCompany: boolean;

    canViewQuotes: boolean;
    canViewClients: boolean;
    canViewProducts: boolean;

    canViewDashboard: boolean;
    canViewAccountantDashboard: boolean;
}

export function usePermissions(
    role: CompanyRole | null | undefined,
    companyOwnerRole?: CompanyOwnerRole | null,
): Permissions {
    return useMemo(() => {
        const r = role ?? null;
        const ownerRole = companyOwnerRole ?? null;

        const isMerchantAdmin = r === 'merchant_admin';
        const isMerchantConsultant = r === 'merchant_consultant';
        const isAccountant = r === 'accountant';
        const isAccountantConsultant = r === 'accountant_consultant';
        const isSuperAdmin = r === 'superadmin';

        const isMerchant = isMerchantAdmin || isMerchantConsultant;
        const isAccountantSide = isAccountant || isAccountantConsultant;
        const isCabinetContext = ownerRole === 'accountant';
        const isMerchantContext = ownerRole === 'merchant_admin';
        const isCabinetAdmin = isCabinetContext && isAccountant;
        const canWriteCabinet = isCabinetContext && isAccountantSide;
        const canWriteMerchantDocuments = isMerchant;
        const canWriteCatalog = isCabinetContext
            ? isAccountantSide
            : isMerchantAdmin;
        const canManageMerchant = isMerchantAdmin;

        return {
            role: r,

            isMerchantAdmin,
            isMerchantConsultant,
            isAccountant,
            isAccountantConsultant,
            isSuperAdmin,
            isMerchant,
            isAccountantSide,
            isCabinetContext,
            isMerchantContext,

            canCreateQuote: canWriteCabinet || canWriteMerchantDocuments,
            canEditQuote: canWriteCabinet || canWriteMerchantDocuments,
            canDeleteQuote: isCabinetAdmin || canManageMerchant,
            canSendQuote: canWriteCabinet || canWriteMerchantDocuments,

            canCreateInvoice: canWriteCabinet || canWriteMerchantDocuments,
            canEditInvoice: canWriteCabinet || canWriteMerchantDocuments,
            canDeleteInvoice: isCabinetAdmin || canManageMerchant,
            canSendInvoice: canWriteCabinet || canWriteMerchantDocuments,
            canCreateCreditNote: isCabinetAdmin || canManageMerchant,

            canCreateProduct: canWriteCatalog,
            canEditProduct: canWriteCatalog,
            canDeleteProduct: isCabinetAdmin || canManageMerchant,

            canCreateClient: canWriteCatalog,
            canEditClient: canWriteCatalog,
            canDeleteClient: isCabinetAdmin || canManageMerchant,

            canAccessSettings: !isSuperAdmin,
            canManageSubscription: canManageMerchant,
            canManageCompanySettings: isCabinetAdmin || canManageMerchant,
            canManageUsers: isCabinetAdmin || canManageMerchant,
            canDeleteCompany: isCabinetAdmin || canManageMerchant,
            canCreateCompany: true,

            canViewQuotes: canWriteCabinet || isMerchant || (isSuperAdmin && isMerchantContext),
            canViewClients: isCabinetContext ? isAccountantSide : isMerchant,
            canViewProducts: isCabinetContext ? isAccountantSide : isMerchant,

            canViewDashboard: true,
            canViewAccountantDashboard: isAccountantSide,
        };
    }, [companyOwnerRole, role]);
}
