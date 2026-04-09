import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Building2, Loader2, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { legalService } from '@/services/api';
import { useCompany } from '@/hooks/useCompany';
import { usePermissions } from '@/hooks/usePermissions';
import type { LegalDocumentSummary } from '@/types';

type EditorState = Record<string, string>;

function getEditorValue(document: LegalDocumentSummary) {
    return (
        document.published_version?.content_text ||
        document.latest_version?.content_text ||
        document.default_content
    );
}

function DocumentEditorCard({
    document,
    value,
    onChange,
    onSave,
    saving,
}: {
    document: LegalDocumentSummary;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">{document.title}</CardTitle>
                        <CardDescription>
                            Texte optionnel utilisé comme CGV par défaut de l’entreprise sur les prochains documents.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={16}
                    className="min-h-[320px] whitespace-pre-wrap font-mono text-sm"
                />

                <div className="flex flex-wrap gap-3">
                    <Button onClick={onSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Enregistrer les CGV
                    </Button>
                </div>

                <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">Prévisualisation</p>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 whitespace-pre-line text-justify text-sm leading-7 text-slate-700">
                            {value || 'Aucune CGV par défaut n’est configurée pour le moment.'}
                        </div>
                    </div>
            </CardContent>
        </Card>
    );
}

export function LegalDocumentsPage() {
    const { toast } = useToast();
    const { currentCompany } = useCompany();
    const permissions = usePermissions(currentCompany?.role, currentCompany?.company_owner_role);
    const [loading, setLoading] = useState(true);
    const [companyDocuments, setCompanyDocuments] = useState<LegalDocumentSummary[]>([]);
    const [editorState, setEditorState] = useState<EditorState>({});
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const canManageCompany = Boolean(currentCompany?.id && permissions.canManageCompanySettings);

    useEffect(() => {
        setEditorState({});
    }, [currentCompany?.id]);

    const hydrateEditorState = (documents: LegalDocumentSummary[]) => {
        setEditorState((current) => {
            const next = { ...current };
            for (const document of documents) {
                if (!(document.id in next)) {
                    next[document.id] = getEditorValue(document);
                }
            }
            return next;
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);

            if (canManageCompany && currentCompany?.id) {
                const response = await legalService.getCompanyDocuments(currentCompany.id);
                setCompanyDocuments(response.documents);
                hydrateEditorState(response.documents);
            } else {
                setCompanyDocuments([]);
            }
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible de charger les CGV de l’entreprise',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [currentCompany?.id, canManageCompany]);

    const handleSave = async (documentId: string) => {
        if (!currentCompany?.id) {
            return;
        }

        try {
            setSavingKey(documentId);
            await legalService.saveCompanyDocument(currentCompany.id, 'sales_terms', {
                content_text: editorState[documentId] || '',
            });

            await loadData();
            toast({
                title: 'CGV enregistrées',
                description: 'Le texte par défaut de l’entreprise a été mis à jour.',
            });
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible d’enregistrer les CGV',
                variant: 'destructive',
            });
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!canManageCompany) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">CGV de l’entreprise</h1>
                    <p className="text-muted-foreground">
                        {currentCompany?.name
                            ? `Cette section n’est pas accessible pour l’entreprise actuellement sélectionnée : ${currentCompany.name}.`
                            : 'Sélectionnez une entreprise pour consulter ou modifier ses CGV.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">CGV de l’entreprise</h1>
                    <p className="text-muted-foreground">
                        Chaque entreprise peut définir ses propres CGV par défaut. Le contenu affiché ici dépend toujours de l’entreprise sélectionnée dans l’en-tête.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link to="/settings">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Retour aux paramètres
                    </Link>
                </Button>
            </div>

            {currentCompany && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="space-y-2 p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Building2 className="h-4 w-4" />
                            Entreprise sélectionnée : {currentCompany.name}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Vous modifiez ici les CGV par défaut de cette entreprise uniquement. Si vous changez d’entreprise dans l’en-tête, cette page recharge les documents de la nouvelle entreprise.
                        </p>
                        {permissions.isAccountantSide && (
                            <p className="text-sm text-muted-foreground">
                                Pour un compte expert-comptable, cela peut correspondre à votre cabinet ou à un dossier client, selon l’entreprise actuellement sélectionnée.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {currentCompany && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold">CGV de l’entreprise sélectionnée</h2>
                            <p className="text-sm text-muted-foreground">
                                Ces CGV par défaut sont propres à {currentCompany.name}. Elles restent facultatives, servent de base pour les prochains documents et restent modifiables sur chaque devis ou facture.
                            </p>
                        </div>
                    </div>
                    {companyDocuments.map((document) => (
                        <DocumentEditorCard
                            key={document.id}
                            document={document}
                            value={editorState[document.id] || ''}
                            onChange={(value) =>
                                setEditorState((current) => ({ ...current, [document.id]: value }))
                            }
                            onSave={() => handleSave(document.id)}
                            saving={savingKey === document.id}
                        />
                    ))}
                </section>
            )}

            {companyDocuments.length === 0 && (
                <Card>
                    <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                        <BookOpenText className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Aucune CGV disponible</p>
                            <p className="text-sm text-muted-foreground">
                                Aucune CGV entreprise n’est accessible avec votre contexte actuel.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
