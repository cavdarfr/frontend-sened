import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    Clock3,
    ExternalLink,
    ListTree,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    getRelatedSupportArticles,
    getSupportArticleBySlug,
    supportCategoryLabels,
    type SupportArticleLink,
} from '@/content/support-content';
import { DEFAULT_DESCRIPTION, formatDocumentTitle } from '@/lib/seo';

function ArticleLink({ link }: { link: SupportArticleLink }) {
    const isAppLink = link.kind === 'app';

    return (
        <Link
            to={link.to}
            className="group flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm transition-all hover:border-primary/30 hover:bg-accent/40"
        >
            <span className="font-medium text-foreground">{link.label}</span>
            {isAppLink ? (
                <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            )}
        </Link>
    );
}

export function SupportArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const article = getSupportArticleBySlug(slug);

    if (!article) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <Helmet>
                    <title>{formatDocumentTitle('Article introuvable')}</title>
                    <meta name="description" content={DEFAULT_DESCRIPTION} />
                </Helmet>
                <div className="rounded-[28px] border border-dashed border-border/80 bg-card/70 p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Article introuvable</h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Ce guide n’existe pas ou n’est plus disponible dans le centre d’aide.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <Button asChild>
                            <Link to="/support">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au centre d’aide
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const relatedArticles = getRelatedSupportArticles(article);

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            <Helmet>
                <title>{formatDocumentTitle(article.title)}</title>
                <meta name="description" content={article.description} />
            </Helmet>
            <div className="rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <Link to="/support" className="font-medium transition-colors hover:text-foreground">
                        Centre d’aide
                    </Link>
                    <span>/</span>
                    <span>{article.title}</span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                        {supportCategoryLabels[article.category]}
                    </Badge>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {article.estimatedReadMinutes} min
                    </div>
                </div>

                <div className="mt-6 max-w-3xl space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{article.title}</h1>
                    <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                        {article.description}
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-foreground/85">
                        {article.summary}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-8">
                    {article.prerequisites && article.prerequisites.length > 0 && (
                        <Card className="overflow-hidden rounded-[28px] border-border/60">
                            <CardHeader className="border-b border-border/60 bg-muted/25">
                                <CardTitle className="text-xl">Avant de commencer</CardTitle>
                                <CardDescription>Pré-requis utiles pour suivre ce guide dans de bonnes conditions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                {article.prerequisites.map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm leading-6 text-foreground/85"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {article.sections.map((section, sectionIndex) => (
                        <Card
                            key={section.id}
                            id={section.id}
                            className="scroll-mt-24 overflow-hidden rounded-[28px] border-border/60"
                        >
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/30 via-background to-background">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Section {sectionIndex + 1}
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl">{section.title}</CardTitle>
                                        {section.summary && (
                                            <CardDescription className="max-w-2xl leading-6">
                                                {section.summary}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {section.steps && section.steps.length > 0 && (
                                    <div className="space-y-4">
                                        {section.steps.map((step, stepIndex) => (
                                            <div
                                                key={step.title}
                                                className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                                        {stepIndex + 1}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-base font-semibold">{step.title}</h3>
                                                        <p className="text-sm leading-7 text-muted-foreground">
                                                            {step.body}
                                                        </p>
                                                        {step.bullets && step.bullets.length > 0 && (
                                                            <div className="space-y-2 pt-1">
                                                                {step.bullets.map((bullet) => (
                                                                    <div key={bullet} className="flex gap-3 text-sm leading-6 text-foreground/85">
                                                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                                                        <span>{bullet}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {section.tips && section.tips.length > 0 && (
                                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <BookOpenText className="h-4 w-4 text-primary" />
                                            À savoir
                                        </div>
                                        <div className="space-y-2">
                                            {section.tips.map((tip) => (
                                                <div key={tip} className="flex gap-3 text-sm leading-6 text-foreground/85">
                                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                                    <span>{tip}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {section.links && section.links.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-foreground">Liens utiles</div>
                                        <div className="grid gap-3">
                                            {section.links.map((link) => (
                                                <ArticleLink key={`${section.id}-${link.label}`} link={link} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {article.commonMistakes && article.commonMistakes.length > 0 && (
                        <Card className="rounded-[28px] border-amber-200/60 bg-amber-50/60 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                            <CardHeader>
                                <CardTitle className="text-xl">Erreurs fréquentes</CardTitle>
                                <CardDescription>Les points qui bloquent le plus souvent les utilisateurs sur ce parcours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {article.commonMistakes.map((mistake) => (
                                    <div key={mistake} className="flex gap-3 rounded-2xl border border-amber-200/70 bg-background/80 px-4 py-3 text-sm leading-6 dark:border-amber-900/40">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <span>{mistake}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                    <Card className="rounded-[28px] border-border/60">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ListTree className="h-4 w-4 text-primary" />
                                <CardTitle className="text-lg">Sommaire</CardTitle>
                            </div>
                            <CardDescription>Naviguez rapidement entre les sections de ce guide.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {article.sections.map((section, index) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm transition-colors hover:bg-accent/40"
                                >
                                    <span className="text-muted-foreground">{index + 1}.</span>
                                    <span className="ml-3 flex-1 font-medium text-foreground">{section.title}</span>
                                </a>
                            ))}
                        </CardContent>
                    </Card>

                    {relatedArticles.length > 0 && (
                        <Card className="rounded-[28px] border-border/60">
                            <CardHeader>
                                <CardTitle className="text-lg">Continuer avec</CardTitle>
                                <CardDescription>Guides complémentaires pour avancer dans votre mise en place.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {relatedArticles.map((related) => (
                                    <Link
                                        key={related.slug}
                                        to={`/support/${related.slug}`}
                                        className="group block rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition-all hover:border-primary/25 hover:bg-accent/30"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium text-foreground">{related.title}</div>
                                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {related.description}
                                                </div>
                                            </div>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="rounded-[28px] border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
                        <CardHeader>
                            <CardTitle className="text-lg">Encore besoin d’aide ?</CardTitle>
                            <CardDescription>Notre équipe support reste joignable si vous avez un blocage précis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full">
                                <a href="mailto:contact@sened.fr">Contacter le support</a>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/support">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour au hub
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
