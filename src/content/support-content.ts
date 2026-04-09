export type SupportCategory =
    | 'onboarding'
    | 'company'
    | 'clients'
    | 'quotes'
    | 'invoices'
    | 'billing'
    | 'settings';

export interface SupportArticleLink {
    label: string;
    to: string;
    kind?: 'article' | 'app';
}

export interface SupportArticleStep {
    title: string;
    body: string;
    bullets?: string[];
}

export interface SupportArticleSection {
    id: string;
    title: string;
    summary?: string;
    steps?: SupportArticleStep[];
    tips?: string[];
    links?: SupportArticleLink[];
}

export interface SupportArticleMeta {
    slug: string;
    title: string;
    description: string;
    category: SupportCategory;
    audience: 'merchant_standard';
    estimatedReadMinutes: number;
}

export interface SupportArticle extends SupportArticleMeta {
    summary: string;
    prerequisites?: string[];
    sections: SupportArticleSection[];
    commonMistakes?: string[];
    relatedArticles?: string[];
}

export interface SupportFaqItem {
    question: string;
    answer: string;
    articleSlug?: string;
}

export const supportCategoryLabels: Record<SupportCategory, string> = {
    onboarding: 'Bien démarrer',
    company: 'Entreprise',
    clients: 'Clients',
    quotes: 'Devis',
    invoices: 'Factures',
    billing: 'Abonnement',
    settings: 'Réglages',
};

export const supportArticles: SupportArticle[] = [
    {
        slug: 'bien-demarrer',
        title: 'Bien démarrer avec SENED',
        description: 'Les premières étapes pour créer votre compte, choisir un plan et prendre en main l’application.',
        category: 'onboarding',
        audience: 'merchant_standard',
        estimatedReadMinutes: 4,
        summary: 'Ce guide vous aide à passer de la création du compte à votre premier espace de travail opérationnel.',
        prerequisites: [
            'Avoir finalisé votre inscription ou votre abonnement.',
            'Disposer au minimum d’une entreprise sélectionnée dans votre espace.',
        ],
        sections: [
            {
                id: 'compte-et-abonnement',
                title: 'Créer votre compte et choisir le bon point de départ',
                steps: [
                    {
                        title: 'Créez votre compte',
                        body: 'Depuis les pages de connexion ou d’inscription, renseignez vos informations, votre rôle principal et acceptez les documents légaux de plateforme.',
                    },
                    {
                        title: 'Choisissez votre plan',
                        body: 'Pendant l’inscription, sélectionnez le plan qui correspond à votre activité. Le paiement peut être demandé selon le rôle et le plan choisis.',
                        bullets: [
                            'Le cycle mensuel ou annuel influence directement le prix affiché.',
                            'Le statut de l’abonnement sera ensuite visible dans Paramètres.',
                        ],
                    },
                    {
                        title: 'Laissez l’application vous rediriger vers le tableau de bord',
                        body: 'Après validation, SENED vous redirige vers le tableau de bord ou vers l’écran d’abonnement si une activation est encore nécessaire.',
                    },
                ],
                links: [
                    { label: 'Comprendre abonnement et facturation', to: '/support/abonnement-facturation', kind: 'article' },
                    { label: 'Paramètres du compte', to: '/settings', kind: 'app' },
                ],
            },
            {
                id: 'premiere-entreprise',
                title: 'Préparer votre premier espace de travail',
                steps: [
                    {
                        title: 'Vérifiez votre entreprise active',
                        body: 'L’entreprise sélectionnée conditionne les devis, factures, clients et produits affichés dans l’interface.',
                    },
                    {
                        title: 'Complétez vos informations de société',
                        body: 'Avant d’éditer vos documents commerciaux, prenez le temps de renseigner le nom, le SIREN, les coordonnées et les informations bancaires.',
                    },
                    {
                        title: 'Repérez la navigation principale',
                        body: 'Les sections Devis, Factures, Avoirs, Clients, Produits, Mes entreprises, Paramètres et Support couvrent le parcours principal marchand.',
                    },
                ],
                links: [
                    { label: 'Configurer son entreprise', to: '/support/configurer-entreprise', kind: 'article' },
                    { label: 'Mes entreprises', to: '/companies', kind: 'app' },
                ],
            },
        ],
        commonMistakes: [
            'Commencer à créer des devis sans avoir vérifié les informations de l’entreprise.',
            'Confondre le tableau de bord global avec l’entreprise actuellement sélectionnée.',
        ],
        relatedArticles: ['configurer-entreprise', 'creer-premier-client', 'abonnement-facturation'],
    },
    {
        slug: 'configurer-entreprise',
        title: 'Configurer son entreprise',
        description: 'Renseigner les informations générales, les coordonnées, la banque et les documents légaux de votre société.',
        category: 'company',
        audience: 'merchant_standard',
        estimatedReadMinutes: 5,
        summary: 'Une entreprise bien configurée fiabilise vos devis, vos factures, vos PDFs et les liens envoyés à vos clients.',
        prerequisites: [
            'Avoir accès à au moins une entreprise dans “Mes entreprises”.',
        ],
        sections: [
            {
                id: 'acces-entreprise',
                title: 'Ouvrir la bonne entreprise',
                steps: [
                    {
                        title: 'Accédez à “Mes entreprises”',
                        body: 'Ouvrez la fiche de l’entreprise que vous souhaitez paramétrer depuis le menu latéral.',
                    },
                    {
                        title: 'Travaillez section par section',
                        body: 'La fiche entreprise est structurée par onglets. Commencez par les informations générales, puis les coordonnées et enfin la banque.',
                    },
                ],
                links: [
                    { label: 'Mes entreprises', to: '/companies', kind: 'app' },
                ],
            },
            {
                id: 'general-contact-banque',
                title: 'Compléter les informations qui apparaissent sur vos documents',
                steps: [
                    {
                        title: 'Renseignez l’identité de l’entreprise',
                        body: 'Ajoutez le nom commercial, la raison sociale si besoin, le SIREN et les informations de TVA lorsque vous les utilisez.',
                    },
                    {
                        title: 'Vérifiez les coordonnées',
                        body: 'Adresse, email et téléphone servent autant à l’affichage interne qu’aux documents envoyés à vos clients.',
                    },
                    {
                        title: 'Ajoutez les coordonnées bancaires',
                        body: 'L’IBAN, le BIC et la banque sont utiles pour les factures et les relances de paiement.',
                    },
                ],
                tips: [
                    'Prenez le temps de vérifier les accents, les majuscules et les coordonnées avant de générer un PDF client.',
                    'Un logo cohérent améliore immédiatement le rendu des devis et factures.',
                ],
            },
            {
                id: 'documents-legaux',
                title: 'Publier vos documents légaux',
                steps: [
                    {
                        title: 'Préparez vos conditions et documents',
                        body: 'SENED permet de gérer les documents légaux de l’entreprise et les conditions utilisées dans les devis.',
                    },
                    {
                        title: 'Ouvrez la zone dédiée',
                        body: 'Depuis Paramètres, accédez à “Documents légaux de l’entreprise” pour créer, modifier et publier vos textes.',
                    },
                ],
                links: [
                    { label: 'Documents légaux de l’entreprise', to: '/settings/legal-documents', kind: 'app' },
                    { label: 'Relances et réglages', to: '/support/relances-reglages', kind: 'article' },
                ],
            },
        ],
        commonMistakes: [
            'Publier des documents sans vérifier que le nom et les coordonnées de l’entreprise sont à jour.',
            'Oublier la partie bancaire avant l’envoi des premières factures.',
        ],
        relatedArticles: ['bien-demarrer', 'relances-reglages'],
    },
    {
        slug: 'creer-premier-client',
        title: 'Créer son premier client',
        description: 'Ajouter un client particulier ou professionnel avec les bonnes informations dès le départ.',
        category: 'clients',
        audience: 'merchant_standard',
        estimatedReadMinutes: 4,
        summary: 'Un client bien renseigné accélère la création de devis, de factures et le suivi des relances.',
        prerequisites: [
            'Avoir une entreprise sélectionnée.',
        ],
        sections: [
            {
                id: 'type-client',
                title: 'Choisir le bon type de client',
                steps: [
                    {
                        title: 'Identifiez si le client est un particulier ou un professionnel',
                        body: 'Ce choix influence les champs affichés, le mode de signature et la manière dont les informations sont utilisées dans les documents.',
                    },
                    {
                        title: 'Saisissez les données minimales utiles',
                        body: 'Nom ou société, email, adresse et informations de contact sont les bases les plus utiles pour commencer.',
                    },
                ],
            },
            {
                id: 'recherche-siren',
                title: 'Utiliser la recherche SIREN/SIRET',
                steps: [
                    {
                        title: 'Lancez une recherche entreprise',
                        body: 'Pour un client professionnel, utilisez le champ de recherche SIREN/SIRET afin de pré-remplir les informations légales et l’adresse.',
                    },
                    {
                        title: 'Contrôlez le résultat importé',
                        body: 'Même après pré-remplissage, vérifiez le nom affiché, le SIREN, l’adresse et l’email de contact.',
                    },
                ],
                tips: [
                    'Conservez un email valide si vous prévoyez l’envoi de devis, de factures ou de relances.',
                ],
            },
            {
                id: 'suite-parcours',
                title: 'Réutiliser le client partout dans l’application',
                steps: [
                    {
                        title: 'Retrouvez votre client dans Devis et Factures',
                        body: 'Une fois créé, le client est sélectionnable lors de la création d’un devis ou d’une facture.',
                    },
                    {
                        title: 'Utilisez la fiche client pour centraliser le suivi',
                        body: 'La fiche détail du client permet ensuite de retrouver ses documents, paiements et relances.',
                    },
                ],
                links: [
                    { label: 'Clients', to: '/clients', kind: 'app' },
                    { label: 'Créer et envoyer un devis', to: '/support/creer-envoyer-devis', kind: 'article' },
                ],
            },
        ],
        commonMistakes: [
            'Créer plusieurs fiches pour le même client faute de recherche préalable.',
            'Laisser l’email vide alors que le client doit recevoir les documents.',
        ],
        relatedArticles: ['creer-envoyer-devis', 'suivre-encaisser-facture'],
    },
    {
        slug: 'creer-envoyer-devis',
        title: 'Créer et envoyer un devis',
        description: 'Assembler un devis clair, ajouter les bons articles et l’envoyer dans de bonnes conditions.',
        category: 'quotes',
        audience: 'merchant_standard',
        estimatedReadMinutes: 6,
        summary: 'Le devis est souvent le premier document client. Ce guide couvre la préparation, le contenu, l’envoi et la signature.',
        prerequisites: [
            'Avoir au moins un client.',
            'Avoir vérifié les informations de votre entreprise.',
        ],
        sections: [
            {
                id: 'creation-devis',
                title: 'Préparer le devis',
                steps: [
                    {
                        title: 'Créez un nouveau devis',
                        body: 'Depuis la section Devis, ouvrez un nouveau document puis sélectionnez le client concerné.',
                    },
                    {
                        title: 'Ajoutez vos lignes de prestation',
                        body: 'Renseignez chaque article avec quantité, prix, TVA et éventuelles remises.',
                        bullets: [
                            'Vous pouvez saisir des lignes manuellement.',
                            'Vous pouvez aussi réutiliser des produits déjà enregistrés.',
                        ],
                    },
                    {
                        title: 'Complétez les informations commerciales',
                        body: 'Ajoutez la date de validité, le sujet du devis et, si nécessaire, des notes ou conditions spécifiques.',
                    },
                ],
            },
            {
                id: 'conditions-envoi',
                title: 'Vérifier avant envoi',
                steps: [
                    {
                        title: 'Contrôlez les conditions générales',
                        body: 'Si votre entreprise utilise des documents légaux publiés, vérifiez que les bonnes conditions sont bien associées au devis.',
                    },
                    {
                        title: 'Prévisualisez le rendu',
                        body: 'Avant d’envoyer, vérifiez le PDF, les totaux et l’identité du client.',
                    },
                    {
                        title: 'Envoyez le devis',
                        body: 'L’envoi peut être suivi depuis le détail du devis. Le statut évolue ensuite selon la consultation, la signature ou la conversion.',
                    },
                ],
                links: [
                    { label: 'Produits et catégories', to: '/support/produits-categories', kind: 'article' },
                    { label: 'Documents légaux de l’entreprise', to: '/settings/legal-documents', kind: 'app' },
                ],
            },
            {
                id: 'signature',
                title: 'Gérer la signature du devis',
                steps: [
                    {
                        title: 'Activez la signature si votre process le prévoit',
                        body: 'Selon votre configuration, le client peut consulter le devis via un lien sécurisé et le signer en ligne.',
                    },
                    {
                        title: 'Suivez le statut',
                        body: 'Le devis peut passer par plusieurs états avant la conversion en facture: envoyé, signé, refusé ou converti.',
                    },
                ],
            },
        ],
        commonMistakes: [
            'Envoyer un devis sans relire les montants ou les remises.',
            'Oublier les conditions légales alors qu’elles sont obligatoires dans votre process commercial.',
        ],
        relatedArticles: ['transformer-devis-facture', 'produits-categories'],
    },
    {
        slug: 'transformer-devis-facture',
        title: 'Transformer un devis en facture',
        description: 'Passer du devis accepté à la facture sans perdre le fil du dossier client.',
        category: 'quotes',
        audience: 'merchant_standard',
        estimatedReadMinutes: 4,
        summary: 'Cette étape permet de facturer rapidement après validation commerciale, tout en gardant la continuité du dossier.',
        prerequisites: [
            'Avoir un devis finalisé ou validé selon votre process.',
        ],
        sections: [
            {
                id: 'conversion',
                title: 'Lancer la conversion',
                steps: [
                    {
                        title: 'Ouvrez le devis concerné',
                        body: 'Depuis la liste ou la fiche du devis, vérifiez que le document est bien le bon avant de lancer la conversion.',
                    },
                    {
                        title: 'Convertissez le devis en facture',
                        body: 'SENED reprend la structure du devis pour générer une facture plus rapidement et maintenir le lien entre les deux documents.',
                    },
                ],
            },
            {
                id: 'verifications',
                title: 'Vérifier les statuts et la cohérence',
                steps: [
                    {
                        title: 'Contrôlez les données de la facture',
                        body: 'Vérifiez les lignes, la TVA, les informations client et les échéances avant envoi.',
                    },
                    {
                        title: 'Comprenez les statuts',
                        body: 'Le devis garde un historique commercial, tandis que la facture entre ensuite dans le cycle d’envoi, consultation, paiement et relance.',
                    },
                ],
                links: [
                    { label: 'Suivre et encaisser une facture', to: '/support/suivre-encaisser-facture', kind: 'article' },
                    { label: 'Factures', to: '/invoices', kind: 'app' },
                ],
            },
        ],
        commonMistakes: [
            'Convertir un brouillon non validé en facture trop tôt.',
            'Ne pas relire la date d’échéance après conversion.',
        ],
        relatedArticles: ['creer-envoyer-devis', 'suivre-encaisser-facture'],
    },
    {
        slug: 'suivre-encaisser-facture',
        title: 'Suivre et encaisser une facture',
        description: 'Envoyer une facture, enregistrer un paiement et suivre les statuts jusqu’au règlement complet.',
        category: 'invoices',
        audience: 'merchant_standard',
        estimatedReadMinutes: 6,
        summary: 'Le suivi de facture mélange envoi, consultation, paiement, PDF et relances. Ce guide couvre le cycle complet.',
        prerequisites: [
            'Avoir au moins une facture émise.',
        ],
        sections: [
            {
                id: 'envoi-et-suivi',
                title: 'Envoyer puis suivre la facture',
                steps: [
                    {
                        title: 'Envoyez la facture depuis sa fiche',
                        body: 'La fiche facture centralise l’envoi, la consultation du PDF et les changements de statut.',
                    },
                    {
                        title: 'Suivez la progression du document',
                        body: 'Le statut permet d’identifier si la facture est envoyée, partiellement réglée, payée ou en retard.',
                    },
                ],
            },
            {
                id: 'paiement-manuel',
                title: 'Enregistrer un paiement',
                steps: [
                    {
                        title: 'Ouvrez l’action de paiement',
                        body: 'Depuis la facture, enregistrez le règlement reçu en choisissant la méthode adaptée: virement, chèque, espèces ou autre.',
                    },
                    {
                        title: 'Vérifiez le montant restant',
                        body: 'SENED ajuste l’état de la facture selon le montant payé. Un paiement partiel conserve un reste dû.',
                    },
                ],
                tips: [
                    'Un bon suivi des paiements améliore les statistiques, les relances et la visibilité client.',
                ],
            },
            {
                id: 'pdf-et-relances',
                title: 'Exploiter les documents et les relances',
                steps: [
                    {
                        title: 'Téléchargez ou partagez le PDF',
                        body: 'La facture peut être consultée ou transmise en PDF à chaque étape du suivi.',
                    },
                    {
                        title: 'Appuyez-vous sur les relances',
                        body: 'Si la facture n’est pas réglée, les rappels peuvent être suivis depuis la fiche facture ou gérés au niveau des réglages de relance.',
                    },
                ],
                links: [
                    { label: 'Relances et réglages', to: '/support/relances-reglages', kind: 'article' },
                    { label: 'Factures', to: '/invoices', kind: 'app' },
                ],
            },
        ],
        commonMistakes: [
            'Marquer une facture comme payée sans vérifier le montant exact reçu.',
            'Lancer des relances automatiques sans avoir configuré les expéditeurs et les templates.',
        ],
        relatedArticles: ['transformer-devis-facture', 'relances-reglages'],
    },
    {
        slug: 'produits-categories',
        title: 'Gérer ses produits et catégories',
        description: 'Construire un catalogue simple à réutiliser dans les devis et factures.',
        category: 'settings',
        audience: 'merchant_standard',
        estimatedReadMinutes: 4,
        summary: 'Un catalogue propre accélère la saisie et limite les erreurs de tarification.',
        prerequisites: [
            'Avoir une entreprise sélectionnée.',
        ],
        sections: [
            {
                id: 'catalogue',
                title: 'Créer un catalogue réutilisable',
                steps: [
                    {
                        title: 'Ajoutez vos produits ou services',
                        body: 'Créez chaque produit avec un nom clair, un prix cohérent, une TVA adaptée et une unité utile pour la facturation.',
                    },
                    {
                        title: 'Rangez-les par catégories',
                        body: 'Les catégories facilitent la navigation et évitent la dispersion lorsque le catalogue grandit.',
                    },
                ],
            },
            {
                id: 'reutilisation',
                title: 'Réutiliser les produits dans vos documents',
                steps: [
                    {
                        title: 'Sélectionnez vos produits au moment de créer le document',
                        body: 'Dans les devis et factures, vous pouvez repartir du catalogue au lieu de ressaisir chaque ligne.',
                    },
                    {
                        title: 'Gardez les exceptions pour les lignes ponctuelles',
                        body: 'Pour les prestations uniques, vous pouvez toujours ajouter une ligne manuelle sans modifier le catalogue.',
                    },
                ],
                links: [
                    { label: 'Produits', to: '/products', kind: 'app' },
                    { label: 'Créer et envoyer un devis', to: '/support/creer-envoyer-devis', kind: 'article' },
                ],
            },
        ],
        commonMistakes: [
            'Multiplier les produits en doublon avec des noms trop proches.',
            'Ne pas harmoniser la TVA et les unités d’un même type de prestation.',
        ],
        relatedArticles: ['creer-envoyer-devis', 'suivre-encaisser-facture'],
    },
    {
        slug: 'abonnement-facturation',
        title: 'Comprendre abonnement et facturation',
        description: 'Lire son plan, suivre sa période, changer d’offre et accéder au portail de facturation.',
        category: 'billing',
        audience: 'merchant_standard',
        estimatedReadMinutes: 5,
        summary: 'Cette page aide à comprendre ce que couvre votre plan et comment gérer sa facturation depuis SENED.',
        prerequisites: [
            'Avoir un compte actif.',
        ],
        sections: [
            {
                id: 'lecture-plan',
                title: 'Lire votre plan actuel',
                steps: [
                    {
                        title: 'Ouvrez Paramètres',
                        body: 'L’onglet abonnement affiche le plan actuel, la période de facturation, l’usage mensuel et l’état du compte.',
                    },
                    {
                        title: 'Interprétez les indicateurs',
                        body: 'Vous pouvez y suivre les limites de devis, de factures, le nombre de membres et la fin de période en cours.',
                    },
                ],
                links: [
                    { label: 'Paramètres', to: '/settings', kind: 'app' },
                ],
            },
            {
                id: 'changer-plan',
                title: 'Changer de plan',
                steps: [
                    {
                        title: 'Choisissez le cycle mensuel ou annuel',
                        body: 'Le changement de cycle modifie les tarifs affichés et la comparaison des offres.',
                    },
                    {
                        title: 'Sélectionnez une nouvelle offre',
                        body: 'Les upgrades et downgrades se gèrent depuis l’interface. Une confirmation peut être demandée pour certaines baisses de plan.',
                    },
                ],
            },
            {
                id: 'portail-stripe',
                title: 'Utiliser le portail de facturation',
                steps: [
                    {
                        title: 'Accédez au portail de facturation si vous avez les droits',
                        body: 'Depuis l’interface, l’accès au portail de facturation permet de gérer les moyens de paiement et certains éléments de facturation.',
                    },
                    {
                        title: 'Gardez en tête la notion de propriétaire de la facturation',
                        body: 'Selon votre rôle, vous pouvez consulter l’abonnement sans avoir le droit de le modifier.',
                    },
                ],
                tips: [
                    'Si l’abonnement est géré par un administrateur, certaines actions seront visibles mais non modifiables.',
                ],
            },
        ],
        commonMistakes: [
            'Comparer deux plans sans regarder le cycle mensuel ou annuel sélectionné.',
            'Penser qu’un collaborateur peut forcément modifier l’abonnement.',
        ],
        relatedArticles: ['bien-demarrer', 'relances-reglages'],
    },
    {
        slug: 'relances-reglages',
        title: 'Configurer relances et réglages',
        description: 'Paramétrer les relances, les expéditeurs et les documents légaux pour sécuriser vos envois.',
        category: 'settings',
        audience: 'merchant_standard',
        estimatedReadMinutes: 6,
        summary: 'Ce guide couvre les réglages qui structurent vos communications client: relances, emails et documents légaux.',
        prerequisites: [
            'Avoir une entreprise sélectionnée.',
            'Avoir configuré au minimum l’email de l’entreprise et les documents essentiels.',
        ],
        sections: [
            {
                id: 'relances',
                title: 'Configurer les relances',
                steps: [
                    {
                        title: 'Ouvrez les réglages de relance',
                        body: 'La page de relances permet d’activer ou non le système, de définir les règles et de personnaliser les expéditeurs.',
                    },
                    {
                        title: 'Ajustez les délais et canaux',
                        body: 'Vous pouvez définir des règles séparées pour les factures et les devis, avec des offsets avant ou après échéance.',
                    },
                ],
                links: [
                    { label: 'Réglages de relance', to: '/settings/reminders', kind: 'app' },
                ],
            },
            {
                id: 'templates-et-expediteurs',
                title: 'Préparer les emails envoyés aux clients',
                steps: [
                    {
                        title: 'Définissez un expéditeur cohérent',
                        body: 'Le nom et l’email d’envoi doivent être cohérents avec votre entreprise et l’adresse configurée côté plateforme.',
                    },
                    {
                        title: 'Créez des templates lisibles',
                        body: 'Des modèles clairs réduisent les erreurs de communication et évitent les relances trop abruptes.',
                    },
                ],
            },
            {
                id: 'documents-legaux',
                title: 'Garder les documents légaux à jour',
                steps: [
                    {
                        title: 'Mettez à jour les documents de l’entreprise',
                        body: 'Vos conditions ou documents légaux doivent refléter la réalité de votre activité et être publiés quand une version est prête.',
                    },
                    {
                        title: 'Reliez-les à vos devis lorsque nécessaire',
                        body: 'Un devis bien préparé doit s’appuyer sur les bons documents avant l’envoi ou la signature.',
                    },
                ],
                links: [
                    { label: 'Documents légaux de l’entreprise', to: '/settings/legal-documents', kind: 'app' },
                    { label: 'Créer et envoyer un devis', to: '/support/creer-envoyer-devis', kind: 'article' },
                ],
            },
        ],
        commonMistakes: [
            'Activer les relances sans avoir relu les modèles envoyés aux clients.',
            'Oublier de republier un document légal après modification.',
        ],
        relatedArticles: ['configurer-entreprise', 'suivre-encaisser-facture'],
    },
];

export const supportFaqs: SupportFaqItem[] = [
    {
        question: 'Par quoi commencer après mon inscription ?',
        answer: 'Commencez par vérifier votre entreprise active, compléter ses informations clés puis créer votre premier client.',
        articleSlug: 'bien-demarrer',
    },
    {
        question: 'Dois-je créer mes produits avant de faire un devis ?',
        answer: 'Ce n’est pas obligatoire, mais un catalogue bien préparé accélère fortement la création de devis et de factures.',
        articleSlug: 'produits-categories',
    },
    {
        question: 'Comment savoir si une facture est vraiment soldée ?',
        answer: 'Le statut de la facture et le montant payé permettent de distinguer un règlement partiel d’un règlement complet.',
        articleSlug: 'suivre-encaisser-facture',
    },
    {
        question: 'Où puis-je modifier mon abonnement ?',
        answer: 'Le changement d’offre se gère depuis Paramètres, à condition que votre rôle vous autorise à gérer la facturation.',
        articleSlug: 'abonnement-facturation',
    },
    {
        question: 'Les relances partent-elles toutes seules ?',
        answer: 'Seulement si les relances sont activées et si vos règles, expéditeurs et templates ont été correctement configurés.',
        articleSlug: 'relances-reglages',
    },
    {
        question: 'Puis-je envoyer un devis avec signature ?',
        answer: 'Oui, si la signature est activée dans votre process. Le client reçoit alors un lien sécurisé pour consulter et signer le document.',
        articleSlug: 'creer-envoyer-devis',
    },
];

export const supportFeaturedArticleSlugs = [
    'bien-demarrer',
    'creer-envoyer-devis',
    'suivre-encaisser-facture',
];

export function getSupportArticleBySlug(slug?: string) {
    return supportArticles.find((article) => article.slug === slug) || null;
}

export function getRelatedSupportArticles(article: SupportArticle) {
    return (article.relatedArticles || [])
        .map((slug) => getSupportArticleBySlug(slug))
        .filter((value): value is SupportArticle => Boolean(value));
}
