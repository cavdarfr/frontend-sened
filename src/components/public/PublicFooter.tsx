import { Link } from 'react-router-dom';

export function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                                <span className="text-lg font-bold text-primary-foreground">S</span>
                            </div>
                            <span className="text-xl font-bold">SENED</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Solution complète de gestion de devis et factures pour les professionnels.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Produit</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#features" className="hover:text-foreground transition-colors">
                                    Fonctionnalités
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="hover:text-foreground transition-colors">
                                    Tarifs
                                </a>
                            </li>
                            <li>
                                <a href="#faq" className="hover:text-foreground transition-colors">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Légal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link to="/legal/mentions-legales" className="hover:text-foreground transition-colors">
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal/confidentialite" className="hover:text-foreground transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link to="/legal/cgv" className="hover:text-foreground transition-colors">
                                    CGV
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="mailto:contact@sened.fr" className="hover:text-foreground transition-colors">
                                    contact@sened.fr
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {currentYear} SENED. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
