import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileSearch, Printer } from 'lucide-react';
import { quoteService } from '@/services/api';
import type { PublicQuoteTerms } from '@/types';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function QuoteTermsPage() {
    const { token = '' } = useParams<{ token: string }>();
    const [document, setDocument] = useState<PublicQuoteTerms | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await quoteService.getTermsSnapshot(token);
                if (!cancelled) {
                    setDocument(data);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Impossible de charger les CGV de ce devis');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)] text-slate-900">
            <PublicNavbar />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] sm:p-10">
                    <div className="relative flex flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                                    Conditions générales du devis
                                </p>
                                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    CGV associées au devis {document?.quote_number || ''}
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                    Cette page affiche uniquement le texte contractuel attaché à ce devis au moment de son envoi.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" asChild>
                                    <Link to={`/quotes/sign/${token}`}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Retour au devis
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimer
                                </Button>
                            </div>
                        </div>

                        {document && (
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                {document.company?.name && (
                                    <span>{document.company.name}</span>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <Card className="border-slate-200 bg-white/95 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
                    <CardContent className="p-6 sm:p-10">
                        {loading && (
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {!loading && document && !document.has_terms_snapshot && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                                <div className="mb-2 flex items-center gap-2 font-medium">
                                    <FileSearch className="h-4 w-4" />
                                    Aucune CGV figée sur ce devis
                                </div>
                                <p>
                                    Ce devis a été envoyé sans conditions générales de vente attachées. Aucune acceptation spécifique
                                    des CGV n’est requise pour ce document.
                                </p>
                            </div>
                        )}

                        {!loading && document?.has_terms_snapshot && (
                            <article className="whitespace-pre-line text-justify text-sm leading-7 text-slate-700 sm:text-[15px]">
                                {document.terms_and_conditions}
                            </article>
                        )}
                    </CardContent>
                </Card>
            </main>

            <PublicFooter />
        </div>
    );
}
