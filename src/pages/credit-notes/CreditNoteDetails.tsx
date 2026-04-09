import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Download, FileText, Send, RefreshCw,
    Building, Mail, Phone, MapPin, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { invoiceService, chorusProService } from '@/services/api';
import { useOperationalCompany } from '@/hooks/useOperationalCompany';
import { useWebSocketEvent } from '@/context/WebSocketContext';
import { getChorusStatusLabel, getChorusStatusColor } from '@/lib/invoice-status-config';
import type { Invoice, ChorusProSubmission, ChorusProSettings } from '@/types';

export function CreditNoteDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { operationalCompany: currentCompany } = useOperationalCompany();

    const [creditNote, setCreditNote] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    // Chorus Pro
    const [chorusSubmission, setChorusSubmission] = useState<ChorusProSubmission | null>(null);
    const [chorusDialogOpen, setChorusDialogOpen] = useState(false);
    const [chorusSubmitting, setChorusSubmitting] = useState(false);
    const [chorusRefreshing, setChorusRefreshing] = useState(false);
    const [chorusEnabled, setChorusEnabled] = useState(false);
    const [chorusSettings, setChorusSettings] = useState<ChorusProSettings | null>(null);
    const [chorusForm, setChorusForm] = useState({
        codeDestinataire: '',
        codeServiceExecutant: '',
        numeroEngagement: '',
        cadreFacturation: 'A1_FACTURE_FOURNISSEUR',
    });

    const loadCreditNote = useCallback(async () => {
        if (!currentCompany || !id) return;
        setLoading(true);
        try {
            const data = await invoiceService.getById(currentCompany.id, id);
            if (data.type !== 'credit_note') {
                navigate('/credit-notes');
                return;
            }
            setCreditNote(data);
        } catch (error: any) {
            console.error('Error loading credit note:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message || 'Impossible de charger l\'avoir',
            });
            navigate('/credit-notes');
        } finally {
            setLoading(false);
        }
    }, [currentCompany?.id, id]);

    useEffect(() => {
        loadCreditNote();
    }, [loadCreditNote]);

    useWebSocketEvent<Invoice>('invoice:updated', (updatedInvoice) => {
        if (updatedInvoice.id === id) {
            setCreditNote(updatedInvoice);
        }
    }, [id]);

    // Load Chorus Pro status
    useEffect(() => {
        if (!currentCompany || !id) return;
        chorusProService.getSettings(currentCompany.id).then((settings: ChorusProSettings | null) => {
            setChorusEnabled(!!settings?.enabled);
            setChorusSettings(settings);
        }).catch(() => {});
        chorusProService.getSubmissionStatus(id).then((sub) => {
            setChorusSubmission(sub);
        }).catch(() => {});
    }, [currentCompany?.id, id]);

    const handleSubmitChorus = async () => {
        if (!id) return;
        setChorusSubmitting(true);
        try {
            const sub = await chorusProService.submitInvoice(id, {
                codeDestinataire: chorusForm.codeDestinataire,
                codeServiceExecutant: chorusForm.codeServiceExecutant || undefined,
                numeroEngagement: chorusForm.numeroEngagement || undefined,
                cadreFacturation: chorusForm.cadreFacturation,
            });
            setChorusSubmission(sub);
            setChorusDialogOpen(false);
            toast({
                title: 'Avoir envoyé',
                description: 'L\'avoir a été soumis à Chorus Pro',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur Chorus Pro',
                description: error.message || 'Impossible d\'envoyer l\'avoir',
            });
        } finally {
            setChorusSubmitting(false);
        }
    };

    const handleRefreshChorusStatus = async () => {
        if (!id) return;
        setChorusRefreshing(true);
        try {
            const sub = await chorusProService.getSubmissionStatus(id);
            setChorusSubmission(sub);
            toast({ title: 'Statut mis à jour' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message });
        } finally {
            setChorusRefreshing(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!currentCompany || !creditNote) return;
        try {
            const blob = await invoiceService.downloadPdf(currentCompany.id, creditNote.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `avoir-${creditNote.invoice_number}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message || 'Impossible de télécharger le PDF',
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(amount));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-64 lg:col-span-2" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!creditNote) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{creditNote.invoice_number}</h1>
                            <Badge className="bg-red-100 text-red-800">
                                <Receipt className="mr-1 h-3 w-3" />
                                Avoir
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {creditNote.client?.company_name || `${creditNote.client?.first_name} ${creditNote.client?.last_name}`}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {chorusEnabled && !['draft', 'cancelled'].includes(creditNote.status) && !chorusSubmission && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setChorusForm({
                                    codeDestinataire: chorusSettings?.default_code_destinataire || creditNote.client?.siret || '',
                                    codeServiceExecutant: chorusSettings?.default_code_service_executant || '',
                                    numeroEngagement: '',
                                    cadreFacturation: chorusSettings?.default_cadre_facturation || 'A1_FACTURE_FOURNISSEUR',
                                });
                                setChorusDialogOpen(true);
                            }}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Chorus Pro
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {creditNote.client && (
                                <div className="space-y-2">
                                    <p className="font-medium">
                                        {creditNote.client.company_name || 
                                         `${creditNote.client.first_name} ${creditNote.client.last_name}`}
                                    </p>
                                    {creditNote.client.email && (
                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            {creditNote.client.email}
                                        </p>
                                    )}
                                    {creditNote.client.phone && (
                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            {creditNote.client.phone}
                                        </p>
                                    )}
                                    {creditNote.client.address && (
                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            {creditNote.client.address}
                                            {creditNote.client.postal_code && `, ${creditNote.client.postal_code}`}
                                            {creditNote.client.city && ` ${creditNote.client.city}`}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Articles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Qté</TableHead>
                                        <TableHead className="text-right">Prix unit. HT</TableHead>
                                        <TableHead className="text-right">TVA</TableHead>
                                        <TableHead className="text-right">Total HT</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creditNote.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">{item.vat_rate}%</TableCell>
                                            <TableCell className="text-right font-medium text-red-600">
                                                -{formatCurrency(item.line_total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {creditNote.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {creditNote.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Date d'émission</span>
                                <span>{formatDate(creditNote.issue_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Créé le</span>
                                <span>{formatDate(creditNote.created_at)}</span>
                            </div>
                            {creditNote.parent_invoice_id && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Facture d'origine</p>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate(`/invoices/${creditNote.parent_invoice_id}`)}
                                        >
                                            Voir la facture
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Récapitulatif</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sous-total HT</span>
                                <span className="text-red-600">-{formatCurrency(creditNote.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">TVA</span>
                                <span className="text-red-600">-{formatCurrency(creditNote.total_vat)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total TTC</span>
                                <span className="text-red-600">-{formatCurrency(creditNote.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {creditNote.subject && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-800 flex items-center gap-2">
                                    Motif de l'avoir
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-700">{creditNote.subject}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Chorus Pro Status */}
                    {chorusSubmission && (
                        <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Send className="h-4 w-4" />
                                    Chorus Pro
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Statut</span>
                                    <Badge className={getChorusStatusColor(chorusSubmission.statut_chorus || '') || ''}>
                                        {chorusSubmission.statut_chorus ? getChorusStatusLabel(chorusSubmission.statut_chorus) : 'Inconnu'}
                                    </Badge>
                                </div>
                                {chorusSubmission.identifiant_facture_cpp && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">ID CPP</span>
                                        <span className="font-mono">{chorusSubmission.identifiant_facture_cpp}</span>
                                    </div>
                                )}
                                {chorusSubmission.numero_facture_chorus && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">N° Chorus</span>
                                        <span className="font-mono">{chorusSubmission.numero_facture_chorus}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envoyé le</span>
                                    <span>{new Date(chorusSubmission.submitted_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {chorusSubmission.error_message && (
                                    <div className="rounded bg-red-50 p-2 text-xs text-red-700">
                                        {chorusSubmission.error_message}
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleRefreshChorusStatus}
                                    disabled={chorusRefreshing}
                                >
                                    <RefreshCw className={`mr-2 h-3 w-3 ${chorusRefreshing ? 'animate-spin' : ''}`} />
                                    Actualiser le statut
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog Chorus Pro */}
            <Dialog open={chorusDialogOpen} onOpenChange={setChorusDialogOpen}>
                <DialogContent className="gap-0 p-0">
                    <DialogHeader className="border-b px-6 py-4">
                        <DialogTitle>Envoyer l'avoir sur Chorus Pro</DialogTitle>
                        <DialogDescription>
                            Soumettre cet avoir via Chorus Pro au destinataire public.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="px-6 py-4">
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Code destinataire (SIRET) *</Label>
                            <Input
                                value={chorusForm.codeDestinataire}
                                onChange={(e) => setChorusForm(prev => ({ ...prev, codeDestinataire: e.target.value }))}
                                placeholder="SIRET du destinataire"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Code service exécutant (optionnel)</Label>
                            <Input
                                value={chorusForm.codeServiceExecutant}
                                onChange={(e) => setChorusForm(prev => ({ ...prev, codeServiceExecutant: e.target.value }))}
                                placeholder="Code service"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Numéro d'engagement (optionnel)</Label>
                            <Input
                                value={chorusForm.numeroEngagement}
                                onChange={(e) => setChorusForm(prev => ({ ...prev, numeroEngagement: e.target.value }))}
                                placeholder="Numéro d'engagement"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cadre de facturation</Label>
                            <Select
                                value={chorusForm.cadreFacturation}
                                onValueChange={(value) => setChorusForm(prev => ({ ...prev, cadreFacturation: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A1_FACTURE_FOURNISSEUR">A1 - Facture fournisseur</SelectItem>
                                    <SelectItem value="A2_FACTURE_FOURNISSEUR_DEJA_PAYEE">A2 - Facture déjà payée</SelectItem>
                                    <SelectItem value="A9_FACTURE_SOUSTRAITANT">A9 - Facture sous-traitant</SelectItem>
                                    <SelectItem value="A12_FACTURE_COTRAITANT">A12 - Facture co-traitant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                    </DialogBody>
                    <DialogFooter className="border-t px-6 py-4">
                        <Button variant="outline" onClick={() => setChorusDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmitChorus}
                            disabled={chorusSubmitting || !chorusForm.codeDestinataire}
                        >
                            {chorusSubmitting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
