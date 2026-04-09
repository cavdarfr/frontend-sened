import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Plus, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useCompany } from '@/hooks/useCompany';
import {
    companyService,
    type AccountantLinkRequest,
    type AccountantLinkRequestCompanySummary,
    LinkedClientWithStats,
} from '@/services/api';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

export function AccountantDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { companies, currentCompany, loading: companiesLoading } = useCompany();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<LinkedClientWithStats[]>([]);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [merchantQuery, setMerchantQuery] = useState('');
    const [merchantResults, setMerchantResults] = useState<AccountantLinkRequestCompanySummary[]>([]);
    const [merchantSearchLoading, setMerchantSearchLoading] = useState(false);
    const [outgoingRequests, setOutgoingRequests] = useState<AccountantLinkRequest[]>([]);
    const [creatingRequestFor, setCreatingRequestFor] = useState<string | null>(null);

    const cabinetCompany = useMemo(() => {
        if (currentCompany && ['accountant', 'accountant_consultant'].includes(currentCompany.role)) {
            return currentCompany;
        }

        return (
            companies.find((company) =>
                company.is_default && ['accountant', 'accountant_consultant'].includes(company.role),
            )
            || companies.find((company) =>
                ['accountant', 'accountant_consultant'].includes(company.role),
            )
            || null
        );
    }, [companies, currentCompany]);

    const canCreateMerchantLinkRequest = cabinetCompany?.role === 'accountant';

    useEffect(() => {
        const loadData = async () => {
            if (companiesLoading) {
                return;
            }

            if (!cabinetCompany) {
                setClients([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [linkedClients, pendingRequests] = await Promise.all([
                    companyService.getLinkedClients(cabinetCompany.id),
                    cabinetCompany.role === 'accountant'
                        ? companyService.getAccountantLinkRequests(cabinetCompany.id, 'outgoing')
                        : Promise.resolve([]),
                ]);
                setClients(linkedClients as LinkedClientWithStats[]);
                setOutgoingRequests(pendingRequests as AccountantLinkRequest[]);
            } catch (error) {
                console.error('Error loading linked clients:', error);
                setClients([]);
                setOutgoingRequests([]);
                toast({
                    variant: 'destructive',
                    title: 'Chargement impossible',
                    description: 'Les dossiers clients et demandes de liaison n’ont pas pu être chargés.',
                });
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, [cabinetCompany?.id, companiesLoading, toast]);

    const handleSearchMerchants = async () => {
        if (!cabinetCompany || cabinetCompany.role !== 'accountant') {
            return;
        }

        if (!merchantQuery.trim()) {
            setMerchantResults([]);
            return;
        }

        try {
            setMerchantSearchLoading(true);
            const results = await companyService.searchMerchants(cabinetCompany.id, merchantQuery);
            setMerchantResults(results);
        } catch (error) {
            console.error('Error searching merchants:', error);
            setMerchantResults([]);
            toast({
                variant: 'destructive',
                title: 'Recherche impossible',
                description: 'Les commerçants éligibles n’ont pas pu être recherchés.',
            });
        } finally {
            setMerchantSearchLoading(false);
        }
    };

    const refreshDashboardData = async () => {
        if (!cabinetCompany) return;

        const [linkedClients, pendingRequests] = await Promise.all([
            companyService.getLinkedClients(cabinetCompany.id),
            cabinetCompany.role === 'accountant'
                ? companyService.getAccountantLinkRequests(cabinetCompany.id, 'outgoing')
                : Promise.resolve([]),
        ]);

        setClients(linkedClients as LinkedClientWithStats[]);
        setOutgoingRequests(pendingRequests as AccountantLinkRequest[]);
    };

    const handleCreateLinkRequest = async (merchantCompanyId: string) => {
        if (!cabinetCompany || cabinetCompany.role !== 'accountant') {
            return;
        }

        try {
            setCreatingRequestFor(merchantCompanyId);
            await companyService.createAccountantLinkRequest(cabinetCompany.id, merchantCompanyId);
            toast({
                title: 'Demande envoyée',
                description: 'Le commerçant peut maintenant accepter ou refuser la liaison depuis son espace entreprise.',
            });
            setMerchantResults((prev) => prev.filter((merchant) => merchant.id !== merchantCompanyId));
            await refreshDashboardData();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Envoi impossible',
                description: error.message || 'La demande de liaison n’a pas pu être envoyée.',
            });
        } finally {
            setCreatingRequestFor(null);
        }
    };

    if (loading || companiesLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!cabinetCompany) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Dossiers clients</h1>
                <p className="text-muted-foreground">
                    Aucun cabinet comptable actif n’est disponible pour cet utilisateur.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Dossiers clients</h1>
                    <p className="text-sm text-muted-foreground">
                        Accédez aux dossiers clients liés à votre cabinet et ouvrez chaque espace de travail.
                    </p>
                </div>
                {canCreateMerchantLinkRequest && (
                    <Button onClick={() => setRequestDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un commerçant
                    </Button>
                )}
            </div>
            {outgoingRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Demandes de liaison en attente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {outgoingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{request.merchant_company.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {[request.merchant_company.siren ? `SIREN : ${request.merchant_company.siren}` : null, request.merchant_company.city].filter(Boolean).join(' • ') || 'Informations partielles'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <Badge variant="secondary">En attente du marchand</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Clients liés ({clients.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {clients.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Aucun client lié à votre cabinet pour le moment.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entreprise</TableHead>
                                    <TableHead>SIRET</TableHead>
                                    <TableHead>Ville</TableHead>
                                    <TableHead className="text-right">CA annuel</TableHead>
                                    <TableHead className="text-right">En retard</TableHead>
                                    <TableHead className="text-right">Factures</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/accountant/clients/${client.id}`)}
                                    >
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{client.siren || '—'}</TableCell>
                                        <TableCell>{client.city || '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(client.stats?.annual_revenue || 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(client.stats?.overdue_count || 0) > 0 ? (
                                                <Badge variant="destructive">
                                                    {client.stats.overdue_count} ({formatCurrency(client.stats.overdue_amount)})
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {client.stats?.invoice_count || 0}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter un commerçant</DialogTitle>
                        <DialogDescription>
                            Recherchez un commerçant déjà inscrit sur la plateforme, puis envoyez-lui une demande de liaison.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nom du commerçant ou SIREN"
                                value={merchantQuery}
                                onChange={(event) => setMerchantQuery(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        void handleSearchMerchants();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void handleSearchMerchants()}
                                disabled={merchantSearchLoading || !merchantQuery.trim()}
                            >
                                {merchantSearchLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {merchantResults.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Aucun commerçant éligible affiché pour le moment.
                                </div>
                            ) : (
                                merchantResults.map((merchant) => (
                                    <div
                                        key={merchant.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">{merchant.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {[merchant.siren ? `SIREN : ${merchant.siren}` : null, merchant.city].filter(Boolean).join(' • ') || 'Informations partielles'}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => void handleCreateLinkRequest(merchant.id)}
                                            disabled={creatingRequestFor === merchant.id}
                                        >
                                            {creatingRequestFor === merchant.id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            Envoyer la demande
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
