import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Mail, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { reminderService } from '@/services/api';
import { useCompany } from '@/hooks/useCompany';
import type { ReminderChannel, ReminderType, EmailTemplate } from '@/types';

// Type local pour le formulaire de règle
interface RuleFormData {
    days_offset: number;
    channel: ReminderChannel;
    email_template_id?: string;
    sms_template?: string;
}

export function ReminderSettingsPage() {
    const { toast } = useToast();
    const { currentCompany } = useCompany();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);

    // État du formulaire
    const [enabled, setEnabled] = useState(false);
    const [invoiceRules, setInvoiceRules] = useState<RuleFormData[]>([]);
    const [quoteRules, setQuoteRules] = useState<RuleFormData[]>([]);
    const [senderEmail, setSenderEmail] = useState('');
    const [senderName, setSenderName] = useState('');

    // Dialog state
    const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    // Nouveau template
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateSubject, setNewTemplateSubject] = useState('');
    const [newTemplateBody, setNewTemplateBody] = useState('');
    const [newTemplateType, setNewTemplateType] = useState<ReminderType>('after_due');

    useEffect(() => {
        const loadData = async () => {
            if (!currentCompany) return;
            setLoading(true);
            try {
                const [settingsData, templatesData] = await Promise.all([
                    reminderService.getSettings(currentCompany.id),
                    reminderService.getTemplates(currentCompany.id),
                ]);
                setTemplates(templatesData);
                
                setEnabled(settingsData.enabled);
                setInvoiceRules(settingsData.invoice_rules || []);
                setQuoteRules(settingsData.quote_rules || []);
                setSenderEmail(settingsData.sender_email || '');
                setSenderName(settingsData.sender_name || '');
            } catch (error) {
                console.error('Error loading reminder settings:', error);
                // Initialiser avec des valeurs par défaut
                setEnabled(false);
                setInvoiceRules([
                    { days_offset: 3, channel: 'email' },
                    { days_offset: 7, channel: 'email' },
                    { days_offset: 14, channel: 'email' },
                ]);
                setQuoteRules([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentCompany]);

    const handleSaveSettings = async () => {
        if (!currentCompany) return;
        setSaving(true);
        try {
            await reminderService.updateSettings(currentCompany.id, {
                enabled,
                invoice_rules: invoiceRules,
                quote_rules: quoteRules,
                sender_email: senderEmail || undefined,
                sender_name: senderName || undefined,
            });
            toast({
                title: 'Paramètres sauvegardés',
                description: 'Les paramètres de relance ont été mis à jour',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de sauvegarder les paramètres',
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

    const updateInvoiceRule = (index: number, field: string, value: any) => {
        const newRules = [...invoiceRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setInvoiceRules(newRules);
    };

    const addQuoteRule = () => {
        setQuoteRules([...quoteRules, { days_offset: -3, channel: 'email' }]);
    };

    const removeQuoteRule = (index: number) => {
        setQuoteRules(quoteRules.filter((_, i) => i !== index));
    };

    const updateQuoteRule = (index: number, field: string, value: any) => {
        const newRules = [...quoteRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setQuoteRules(newRules);
    };

    const handleCreateTemplate = async () => {
        if (!currentCompany || !newTemplateName || !newTemplateSubject || !newTemplateBody) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Veuillez remplir tous les champs du template',
            });
            return;
        }

        try {
            const template = await reminderService.createTemplate(currentCompany.id, {
                name: newTemplateName,
                subject: newTemplateSubject,
                body_html: newTemplateBody,
                type: newTemplateType,
            });
            setTemplates([...templates, template]);
            setNewTemplateName('');
            setNewTemplateSubject('');
            setNewTemplateBody('');
            toast({
                title: 'Template créé',
                description: 'Le template a été créé avec succès',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de créer le template',
            });
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!currentCompany) return;
        try {
            await reminderService.deleteTemplate(currentCompany.id, templateId);
            setTemplates(templates.filter(t => t.id !== templateId));
            toast({
                title: 'Template supprimé',
                description: 'Le template a été supprimé',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de supprimer le template',
            });
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <Skeleton className="h-8 w-48" />
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
                    Configurez les rappels automatiques pour les factures impayées
                </p>
            </div>

            {/* Activation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Activation
                    </CardTitle>
                    <CardDescription>
                        Activez ou désactivez les relances automatiques
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Relances automatiques</Label>
                            <p className="text-sm text-muted-foreground">
                                Envoyer automatiquement des relances pour les factures en retard
                            </p>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>

                    {enabled && (
                        <div className="grid gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="senderName">Nom de l'expéditeur</Label>
                                <Input
                                    id="senderName"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="Ex: Votre Entreprise"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senderEmail">Email de l'expéditeur</Label>
                                <Input
                                    id="senderEmail"
                                    type="email"
                                    value={senderEmail}
                                    onChange={(e) => setSenderEmail(e.target.value)}
                                    placeholder="Ex: noreply@votre-entreprise.com"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Règles de relance pour les factures */}
            {enabled && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Relances factures
                            </CardTitle>
                            <CardDescription>
                                Définissez quand envoyer les relances après l'échéance des factures
                            </CardDescription>
                        </div>
                        <Button onClick={addInvoiceRule} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une règle
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {invoiceRules.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                Aucune règle définie. Ajoutez une règle pour activer les relances.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jours après échéance</TableHead>
                                        <TableHead>Canal</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceRules.map((rule, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="90"
                                                    value={rule.days_offset}
                                                    onChange={(e) => updateInvoiceRule(index, 'days_offset', parseInt(e.target.value) || 1)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={rule.channel}
                                                    onValueChange={(value) => updateInvoiceRule(index, 'channel', value as ReminderChannel)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="sms">SMS</SelectItem>
                                                        <SelectItem value="both">Les deux</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={rule.email_template_id || 'default'}
                                                    onValueChange={(value) => updateInvoiceRule(index, 'email_template_id', value === 'default' ? undefined : value)}
                                                >
                                                    <SelectTrigger className="w-48">
                                                        <SelectValue placeholder="Template par défaut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="default">Template par défaut</SelectItem>
                                                        {templates
                                                            .filter(t => t.type === 'after_due')
                                                            .map((template) => (
                                                                <SelectItem key={template.id} value={template.id}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeInvoiceRule(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Règles de relance pour les devis */}
            {enabled && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Rappels devis
                            </CardTitle>
                            <CardDescription>
                                Définissez quand envoyer des rappels avant l'expiration des devis
                            </CardDescription>
                        </div>
                        <Button onClick={addQuoteRule} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une règle
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {quoteRules.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                Aucune règle définie pour les devis.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jours avant expiration</TableHead>
                                        <TableHead>Canal</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quoteRules.map((rule, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="-30"
                                                    max="-1"
                                                    value={rule.days_offset}
                                                    onChange={(e) => updateQuoteRule(index, 'days_offset', parseInt(e.target.value) || -1)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={rule.channel}
                                                    onValueChange={(value) => updateQuoteRule(index, 'channel', value as ReminderChannel)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="sms">SMS</SelectItem>
                                                        <SelectItem value="both">Les deux</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={rule.email_template_id || 'default'}
                                                    onValueChange={(value) => updateQuoteRule(index, 'email_template_id', value === 'default' ? undefined : value)}
                                                >
                                                    <SelectTrigger className="w-48">
                                                        <SelectValue placeholder="Template par défaut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="default">Template par défaut</SelectItem>
                                                        {templates
                                                            .filter(t => t.type === 'quote_expiring')
                                                            .map((template) => (
                                                                <SelectItem key={template.id} value={template.id}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeQuoteRule(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Templates */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Templates personnalisés
                    </CardTitle>
                    <CardDescription>
                        Créez des templates pour personnaliser vos messages de relance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Liste des templates existants */}
                    {templates.length > 0 && (
                        <div className="space-y-2">
                            <Label>Templates existants</Label>
                            <div className="space-y-2">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{template.name}</p>
                                                <Badge variant="outline">
                                                    {template.type === 'after_due' ? 'Après échéance' : 
                                                     template.type === 'before_due' ? 'Avant échéance' : 
                                                     'Expiration devis'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {template.subject}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setSelectedTemplateId(template.id); setDeleteTemplateDialogOpen(true); }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nouveau template */}
                    <div className="space-y-4 border-t pt-4">
                        <Label>Nouveau template</Label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="templateName">Nom</Label>
                                <Input
                                    id="templateName"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="Ex: Relance 1ère semaine"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="templateType">Type</Label>
                                <Select value={newTemplateType} onValueChange={(v) => setNewTemplateType(v as ReminderType)}>
                                    <SelectTrigger id="templateType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="before_due">Avant échéance</SelectItem>
                                        <SelectItem value="after_due">Après échéance</SelectItem>
                                        <SelectItem value="quote_expiring">Expiration devis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateSubject">Sujet</Label>
                            <Input
                                id="templateSubject"
                                value={newTemplateSubject}
                                onChange={(e) => setNewTemplateSubject(e.target.value)}
                                placeholder="Ex: Relance facture {{invoice_number}}"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateBody">Corps du message (HTML)</Label>
                            <Textarea
                                id="templateBody"
                                value={newTemplateBody}
                                onChange={(e) => setNewTemplateBody(e.target.value)}
                                placeholder="<p>Bonjour {{client_name}},</p>
<p>Nous vous rappelons que la facture {{invoice_number}} d'un montant de {{amount}} est en attente de règlement depuis le {{due_date}}.</p>
<p>Cordialement,<br>{{company_name}}</p>"
                                rows={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Variables disponibles: {'{{'} client_name {'}}'}, {'{{'} invoice_number {'}}'}, 
                                {'{{'} amount {'}}'}, {'{{'} due_date {'}}'}, {'{{'} company_name {'}}'}, 
                                {'{{'} payment_link {'}}'}
                            </p>
                        </div>
                        <Button onClick={handleCreateTemplate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Créer le template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </Button>
            </div>

            {/* Dialog suppression template */}
            <AlertDialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce template ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { if (selectedTemplateId) handleDeleteTemplate(selectedTemplateId); }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
