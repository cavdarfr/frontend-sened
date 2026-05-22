import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Eye, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { usePermissions } from '@/hooks/usePermissions';
import { reminderService } from '@/services/api';
import type { ReminderEmailPreview } from '@/types';

interface RuleFormData {
    days_offset: number;
    channel: 'email';
    level?: 1 | 2 | 3;
}

const defaultInvoiceRules: RuleFormData[] = [
    { days_offset: -7, channel: 'email' },
    { days_offset: -3, channel: 'email' },
    { days_offset: -1, channel: 'email' },
    { days_offset: 1, channel: 'email', level: 1 },
    { days_offset: 7, channel: 'email', level: 1 },
    { days_offset: 14, channel: 'email', level: 2 },
    { days_offset: 30, channel: 'email', level: 3 },
];

const defaultQuoteRules: RuleFormData[] = [
    { days_offset: -3, channel: 'email' },
    { days_offset: -1, channel: 'email' },
];

const emailOnlyRules = (rules: Array<{ days_offset: number }>): RuleFormData[] =>
    rules.map((rule) => ({
        days_offset: rule.days_offset,
        channel: 'email',
    }));

const defaultInvoiceLevel = (daysOffset: number): 1 | 2 | 3 => {
    if (daysOffset >= 30) return 3;
    if (daysOffset >= 14) return 2;
    return 1;
};

const normalizeInvoiceRules = (rules: Array<{ days_offset: number; level?: 1 | 2 | 3 | null }>): RuleFormData[] =>
    rules.map((rule) => ({
        days_offset: rule.days_offset,
        channel: 'email',
        ...(rule.days_offset > 0
            ? { level: rule.level || defaultInvoiceLevel(rule.days_offset) }
            : {}),
    }));

const formatInvoiceDelay = (daysOffset: number) => {
    if (daysOffset === 0) return "Le jour de l'échéance";

    const count = Math.abs(daysOffset);
    const unit = count > 1 ? 'jours' : 'jour';
    return daysOffset < 0
        ? `${count} ${unit} avant échéance`
        : `${count} ${unit} après échéance`;
};

const formatQuoteDelay = (daysOffset: number) => {
    const count = Math.abs(daysOffset);
    const unit = count > 1 ? 'jours' : 'jour';
    return `${count} ${unit} avant expiration`;
};

interface AutomaticReminderSettingsProps {
    companyId: string;
    companyName?: string;
    canManage?: boolean;
}

export function AutomaticReminderSettings({
    companyId,
    companyName,
    canManage = true,
}: AutomaticReminderSettingsProps) {
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [invoiceRules, setInvoiceRules] = useState<RuleFormData[]>([]);
    const [quoteRules, setQuoteRules] = useState<RuleFormData[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<ReminderEmailPreview | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const settingsData = await reminderService.getSettings(companyId);
                setEnabled(settingsData.enabled);
                setInvoiceRules(normalizeInvoiceRules(settingsData.invoice_rules || []));
                setQuoteRules(emailOnlyRules(settingsData.quote_rules || []));
            } catch (error) {
                console.error('Error loading automatic reminder settings:', error);
                setEnabled(false);
                setInvoiceRules(defaultInvoiceRules);
                setQuoteRules(defaultQuoteRules);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [companyId]);

    const handleSaveSettings = async () => {
        if (!canManage) return;

        setSaving(true);
        try {
            await reminderService.updateSettings(companyId, {
                enabled,
                invoice_rules: normalizeInvoiceRules(invoiceRules),
                quote_rules: emailOnlyRules(quoteRules),
            });
            toast({
                title: 'Paramètres sauvegardés',
                description: 'Les relances automatiques ont été mises à jour',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder les relances automatiques',
            });
        } finally {
            setSaving(false);
        }
    };

    const addInvoiceRule = () => {
        setInvoiceRules([...invoiceRules, { days_offset: 7, channel: 'email' }]);
    };

    const removeInvoiceRule = (index: number) => {
        setInvoiceRules(invoiceRules.filter((_, i) => i !== index));
    };

    const updateInvoiceRule = (
        index: number,
        field: 'days_offset',
        value: number,
    ) => {
        void field;
        const newRules = [...invoiceRules];
        newRules[index] = {
            days_offset: value,
            channel: 'email',
            ...(value > 0
                ? { level: newRules[index].level || defaultInvoiceLevel(value) }
                : {}),
        };
        setInvoiceRules(newRules);
    };

    const updateInvoiceRuleLevel = (index: number, level: 1 | 2 | 3) => {
        const newRules = [...invoiceRules];
        if (newRules[index].days_offset <= 0) return;
        newRules[index] = { ...newRules[index], level };
        setInvoiceRules(newRules);
    };

    const addQuoteRule = () => {
        setQuoteRules([...quoteRules, { days_offset: -3, channel: 'email' }]);
    };

    const removeQuoteRule = (index: number) => {
        setQuoteRules(quoteRules.filter((_, i) => i !== index));
    };

    const updateQuoteRule = (
        index: number,
        field: 'days_offset',
        value: number,
    ) => {
        void field;
        const newRules = [...quoteRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setQuoteRules(newRules);
    };

    const openPreview = async (documentType: 'invoice' | 'quote', rule: RuleFormData) => {
        setPreviewOpen(true);
        setPreview(null);
        setPreviewLoading(true);

        try {
            const previewData = await reminderService.previewEmail(companyId, {
                document_type: documentType,
                days_offset: rule.days_offset,
                ...(documentType === 'invoice' && rule.days_offset > 0
                    ? { level: rule.level || defaultInvoiceLevel(rule.days_offset) }
                    : {}),
            });
            setPreview(previewData);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Aperçu indisponible',
                description: "Impossible de générer l'aperçu de l'email.",
            });
            setPreviewOpen(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    const renderRuleList = (
        rules: RuleFormData[],
        options: {
            documentType: 'invoice' | 'quote';
            emptyLabel: string;
            inputLabel: string;
            inputMin: number;
            inputMax: number;
            formatDelay: (daysOffset: number) => string;
            updateRule: (index: number, field: 'days_offset', value: number) => void;
            removeRule: (index: number) => void;
            deleteLabel: string;
            level?: {
                updateRuleLevel: (index: number, level: 1 | 2 | 3) => void;
            };
        },
    ) => {
        if (rules.length === 0) {
            return (
                <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    {options.emptyLabel}
                </p>
            );
        }

        return (
            <div className="space-y-2">
                {rules.map((rule, index) => (
                    <div
                        key={index}
                        className={
                            options.level && rule.days_offset > 0
                                ? "grid gap-3 rounded-md border bg-background px-3 py-3 sm:grid-cols-[minmax(0,1fr)_112px_160px_76px] sm:items-center"
                                : "grid gap-3 rounded-md border bg-background px-3 py-3 sm:grid-cols-[minmax(0,1fr)_112px_76px] sm:items-center"
                        }
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                {options.formatDelay(rule.days_offset)}
                            </p>
                            <p className="text-xs text-muted-foreground">Email automatique</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="sr-only" htmlFor={`${options.inputLabel}-${index}`}>
                                {options.inputLabel}
                            </Label>
                            <Input
                                id={`${options.inputLabel}-${index}`}
                                type="number"
                                min={options.inputMin}
                                max={options.inputMax}
                                value={rule.days_offset}
                                onChange={(e) =>
                                    options.updateRule(
                                        index,
                                        'days_offset',
                                        Number.parseInt(e.target.value, 10) || 0,
                                    )
                                }
                                className="h-9 w-24"
                                disabled={!canManage}
                            />
                            <span className="text-xs text-muted-foreground sm:hidden">jours</span>
                        </div>
                        {options.level && rule.days_offset > 0 && (
                            <div>
                                <Label className="sr-only" htmlFor={`${options.inputLabel}-niveau-${index}`}>
                                    Niveau de relance
                                </Label>
                                <Select
                                    value={String(rule.level || defaultInvoiceLevel(rule.days_offset))}
                                    onValueChange={(value) =>
                                        options.level?.updateRuleLevel(index, Number(value) as 1 | 2 | 3)
                                    }
                                    disabled={!canManage}
                                >
                                    <SelectTrigger id={`${options.inputLabel}-niveau-${index}`} className="h-9 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Niveau 1</SelectItem>
                                        <SelectItem value="2">Niveau 2</SelectItem>
                                        <SelectItem value="3">Niveau 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="flex items-center gap-1 justify-self-start sm:justify-self-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openPreview(options.documentType, rule)}
                                aria-label="Voir l'aperçu de l'email"
                                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => options.removeRule(index)}
                                aria-label={options.deleteLabel}
                                disabled={!canManage}
                                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <Skeleton className="h-8 w-64" />
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Relances automatiques</h1>
                <p className="text-muted-foreground">
                    Gérez uniquement les emails envoyés automatiquement par le système.
                </p>
                {companyName && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        Entreprise concernée : {companyName}
                    </p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Activation
                    </CardTitle>
                    <CardDescription>
                        Ces règles concernent uniquement les emails envoyés automatiquement chaque jour.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <Label>Relances automatiques</Label>
                            <p className="text-sm text-muted-foreground">
                                Les relances manuelles restent disponibles depuis les factures.
                            </p>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={!canManage} />
                    </div>
                    {!canManage && (
                        <p className="text-sm text-muted-foreground">
                            Vous pouvez consulter ces règles, mais seuls les administrateurs de l'entreprise peuvent les modifier.
                        </p>
                    )}
                </CardContent>
            </Card>

            {enabled && (
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Relances factures
                            </CardTitle>
                            <CardDescription>
                                Définissez les relances avant ou après l'échéance des factures.
                            </CardDescription>
                        </div>
                        <Button onClick={addInvoiceRule} size="sm" disabled={!canManage} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une règle
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {renderRuleList(invoiceRules, {
                            documentType: 'invoice',
                            emptyLabel: 'Aucune règle automatique définie pour les factures.',
                            inputLabel: 'delai-facture',
                            inputMin: -365,
                            inputMax: 365,
                            formatDelay: formatInvoiceDelay,
                            updateRule: updateInvoiceRule,
                            removeRule: removeInvoiceRule,
                            deleteLabel: 'Supprimer la règle facture',
                            level: {
                                updateRuleLevel: updateInvoiceRuleLevel,
                            },
                        })}
                    </CardContent>
                </Card>
            )}

            {enabled && (
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Relances devis
                            </CardTitle>
                            <CardDescription>
                                Définissez les relances avant l'expiration des devis.
                            </CardDescription>
                        </div>
                        <Button onClick={addQuoteRule} size="sm" disabled={!canManage} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une règle
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {renderRuleList(quoteRules, {
                            documentType: 'quote',
                            emptyLabel: 'Aucune règle automatique définie pour les devis.',
                            inputLabel: 'delai-devis',
                            inputMin: -365,
                            inputMax: -1,
                            formatDelay: formatQuoteDelay,
                            updateRule: updateQuoteRule,
                            removeRule: removeQuoteRule,
                            deleteLabel: 'Supprimer la règle devis',
                        })}
                    </CardContent>
                </Card>
            )}

            {canManage && (
                <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                    </Button>
                </div>
            )}

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-h-[94vh] w-[calc(100vw-1rem)] max-w-4xl gap-0 overflow-hidden p-0 sm:w-[calc(100vw-2rem)]">
                    <DialogHeader className="border-b px-4 py-4 sm:px-6">
                        <DialogTitle>Aperçu de l'email automatique</DialogTitle>
                        <DialogDescription>
                            {preview?.context || "Génération de l'aperçu en cours..."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
                        {previewLoading && (
                            <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Génération de l'aperçu...
                            </div>
                        )}

                        {!previewLoading && preview && (
                            <>
                                <div className="rounded-md border bg-muted/30 px-3 py-2">
                                    <p className="text-xs font-medium uppercase text-muted-foreground">Objet</p>
                                    <p className="mt-1 text-sm font-medium">{preview.subject}</p>
                                </div>

                                <div className="overflow-hidden rounded-md border bg-white">
                                    <iframe
                                        title="Aperçu HTML de l'email"
                                        srcDoc={preview.html}
                                        className="h-[68vh] min-h-[520px] w-full bg-white sm:h-[62vh]"
                                        sandbox=""
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function ReminderSettingsPage() {
    const { currentCompany } = useCompany();
    const permissions = usePermissions(currentCompany?.role, currentCompany?.company_owner_role);

    if (!currentCompany) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    return (
        <AutomaticReminderSettings
            companyId={currentCompany.id}
            companyName={currentCompany.name}
            canManage={permissions.canManageCompanySettings}
        />
    );
}
