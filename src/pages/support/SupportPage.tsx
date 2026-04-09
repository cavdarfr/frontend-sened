import { HelpCircle, MessageCircle, Mail, Book } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Page de support
 */
export function SupportPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Centre d'aide</h1>
                <p className="text-muted-foreground">Comment pouvons-nous vous aider ?</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Book className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Documentation</CardTitle>
                                <CardDescription>Guides et tutoriels</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <HelpCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">FAQ</CardTitle>
                                <CardDescription>Questions fréquentes</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Chat en direct</CardTitle>
                                <CardDescription>Parlez à notre équipe</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Contact</CardTitle>
                                <CardDescription>Envoyez-nous un email</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Besoin d'aide ?</CardTitle>
                    <CardDescription>
                        Notre équipe est disponible du lundi au vendredi, de 9h à 18h.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Contacter le support
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
