import {
    FileText, Send, CheckCircle, AlertTriangle, Ban,
} from 'lucide-react';
import type { InvoiceStatus } from '@/types';

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
};

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
};

export const invoiceStatusIcons: Record<InvoiceStatus, React.ComponentType<{ className?: string }>> = {
    draft: FileText,
    sent: Send,
    paid: CheckCircle,
    overdue: AlertTriangle,
    cancelled: Ban,
};

/**
 * Labels FR pour les statuts Chorus Pro courants
 */
export const chorusStatusLabels: Record<string, string> = {
    DEPOSEE: 'Déposée',
    EN_COURS_ACHEMINEMENT: 'En cours d\'acheminement',
    MISE_A_DISPOSITION: 'Mise à disposition',
    SUSPENDUE: 'Suspendue',
    REJETEE: 'Rejetée',
    MANDATEE: 'Mandatée',
    MISE_EN_PAIEMENT: 'Mise en paiement',
    COMPTABILISEE: 'Comptabilisée',
    SERVICE_FAIT: 'Service fait',
    A_RECYCLER: 'À recycler',
    COMPLETEE: 'Complétée',
    VALIDEE: 'Validée',
    EN_COURS_TRAITEMENT: 'En cours de traitement',
    ERREUR: 'Erreur',
    ANNULEE: 'Annulée',
};

export function getChorusStatusLabel(chorusStatus: string): string {
    return chorusStatusLabels[chorusStatus] || chorusStatus;
}

export function getChorusStatusColor(chorusStatus: string): string {
    if (['MISE_A_DISPOSITION', 'COMPLETEE', 'VALIDEE', 'MANDATEE', 'MISE_EN_PAIEMENT', 'SERVICE_FAIT', 'COMPTABILISEE'].includes(chorusStatus)) {
        return 'bg-green-100 text-green-800';
    }
    if (chorusStatus === 'SUSPENDUE') {
        return 'bg-orange-100 text-orange-800';
    }
    if (['REJETEE', 'A_RECYCLER', 'ERREUR'].includes(chorusStatus)) {
        return 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
}
