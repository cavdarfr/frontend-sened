import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { STATIC_LEGAL_DOCUMENTS } from '@/content/legal';

export function LegalDocumentPage() {
    const { slug = '' } = useParams<{ slug: string }>();
    const document = useMemo(
        () =>
            STATIC_LEGAL_DOCUMENTS[slug as keyof typeof STATIC_LEGAL_DOCUMENTS] || null,
        [slug],
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <PublicNavbar />

            <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-5">
                        <Button variant="ghost" asChild className="w-fit px-0 text-slate-600 hover:bg-transparent hover:text-slate-900">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au site
                            </Link>
                        </Button>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                {document?.eyebrow || 'Document légal'}
                            </p>
                            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.5rem]">
                                {document?.title || 'Document légal introuvable'}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                {document?.description || 'Ce document n’est pas disponible.'}
                            </p>
                        </div>
                    </div>
                </section>

                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6 sm:p-8">
                        {!document && (
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                                Ce document n’existe pas.
                            </div>
                        )}

                        {document && (
                            <article className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-[15px]">
                                {document.content}
                            </article>
                        )}
                    </CardContent>
                </Card>
            </main>

            <PublicFooter />
        </div>
    );
}
