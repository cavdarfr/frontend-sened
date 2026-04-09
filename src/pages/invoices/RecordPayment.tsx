import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { invoiceService, paymentService } from '@/services/api';
import { useOperationalCompany } from '@/hooks/useOperationalCompany';
import type { Invoice, PaymentMethod } from '@/types';

const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'cash', label: 'Espèces' },
    { value: 'card', label: 'Carte bancaire' },
    { value: 'other', label: 'Autre' },
];

const blockedInvoiceStatuses = ['draft', 'cancelled', 'paid'] as const;

function isBlockedInvoiceStatus(status: Invoice['status']) {
    return blockedInvoiceStatuses.includes(status as (typeof blockedInvoiceStatuses)[number]);
}

export function RecordPayment() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { operationalCompany: currentCompany } = useOperationalCompany();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [amount, setAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        const loadInvoice = async () => {
            if (!currentCompany || !id) return;
            setLoading(true);
            try {
                const data = await invoiceService.getById(currentCompany.id, id);

                if (isBlockedInvoiceStatus(data.status)) {
                    toast({
                        variant: 'destructive',
                        title: 'Paiement impossible',
                        description: 'Impossible d’enregistrer un paiement sur cette facture.',
                    });
                    navigate(`/invoices/${data.id}`);
                    return;
                }

                setInvoice(data);
                // Default amount is remaining
                setAmount(data.total - data.amount_paid);
            } catch (error: any) {
                console.error('Error loading invoice:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: error.message || 'Impossible de charger la facture',
                });
                navigate('/invoices');
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [currentCompany, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCompany || !invoice) return;

        if (isBlockedInvoiceStatus(invoice.status)) {
            toast({
                variant: 'destructive',
                title: 'Paiement impossible',
                description: 'Impossible d’enregistrer un paiement sur cette facture.',
            });
            navigate(`/invoices/${invoice.id}`);
            return;
        }

        if (amount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Le montant doit être supérieur à 0',
            });
            return;
        }

        const remainingAmount = invoice.total - invoice.amount_paid;
        if (amount > remainingAmount) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: `Le montant ne peut pas dépasser ${formatCurrency(remainingAmount)}`,
            });
            return;
        }

        setSaving(true);
        try {
            await paymentService.recordManual(currentCompany.id, {
                invoice_id: invoice.id,
                amount,
                payment_method: paymentMethod,
                paid_at: paymentDate,
                reference: reference || undefined,
                notes: notes || undefined,
            });
            toast({
                title: 'Paiement enregistré',
                description: 'Le paiement a été enregistré avec succès',
            });
            navigate(`/invoices/${invoice.id}`);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message || 'Impossible d\'enregistrer le paiement',
            });
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!invoice) {
        return null;
    }

    const remainingAmount = invoice.total - invoice.amount_paid;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* En-tête */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Enregistrer un paiement</h1>
                    <p className="text-muted-foreground">
                        Facture {invoice.invoice_number}
                    </p>
                </div>
            </div>

            {/* Résumé facture */}
            <Card>
                <CardHeader>
                    <CardTitle>Résumé de la facture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total facture</span>
                        <span className="font-medium">{formatCurrency(invoice.total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Déjà payé</span>
                        <span className="font-medium text-green-600">{formatCurrency(invoice.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Reste à payer</span>
                        <span className="font-bold text-lg">{formatCurrency(remainingAmount)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Détails du paiement
                        </CardTitle>
                        <CardDescription>
                            Enregistrez un paiement reçu pour cette facture
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Montant *</Label>
                                <NumericInput
                                    id="amount"
                                    min="0.01"
                                    max={remainingAmount}
                                    step="0.01"
                                    value={amount}
                                    onValueChange={setAmount}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">Date de paiement *</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Méthode de paiement *</Label>
                            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference">Référence de paiement</Label>
                            <Input
                                id="reference"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Ex: Numéro de chèque, référence virement..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notes complémentaires..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer le paiement'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
