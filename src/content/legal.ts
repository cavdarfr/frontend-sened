export type StaticLegalDocumentSlug =
    | 'cgv'
    | 'confidentialite'
    | 'mentions-legales';

export interface StaticLegalDocument {
    slug: StaticLegalDocumentSlug;
    title: string;
    eyebrow: string;
    description: string;
    content: string;
}

export const STATIC_LEGAL_DOCUMENTS: Record<
    StaticLegalDocumentSlug,
    StaticLegalDocument
> = {
    cgv: {
        slug: 'cgv',
        title: 'Conditions générales de vente',
        eyebrow: 'Cadre contractuel',
        description:
            'Les conditions générales de vente définissent les règles applicables au service SENED.',
        content: `SENED - Conditions générales de vente

1. Objet
Les présentes conditions générales de vente encadrent l'accès et l'utilisation du service SENED de gestion de devis, factures et abonnements professionnels.

2. Éditeur
Le service SENED est édité par son exploitant. Les coordonnées légales et de contact sont disponibles dans les mentions légales.

3. Compte utilisateur
L'utilisateur s'engage à fournir des informations exactes, à préserver la confidentialité de ses accès et à utiliser la plateforme dans un cadre professionnel conforme.

4. Abonnements et tarifs
Les tarifs applicables sont ceux affichés au moment de la souscription. Sauf mention contraire, les prix sont exprimés hors taxes.

5. Paiement
Le paiement est exigible selon les modalités proposées lors de la souscription. En cas d'incident de paiement, l'accès au service peut être suspendu jusqu'à régularisation.

6. Disponibilité du service
SENED met en oeuvre des moyens raisonnables pour assurer la disponibilité de la plateforme, sous réserve des opérations de maintenance, de sécurité ou d'évolution.

7. Données personnelles
Le traitement des données personnelles est décrit dans la politique de confidentialité accessible sur la plateforme.

8. Propriété intellectuelle
Les contenus, marques, logiciels et éléments graphiques de SENED restent protégés par le droit applicable.

9. Responsabilité
SENED ne saurait être responsable des erreurs de saisie, omissions ou usages non conformes effectués par l'utilisateur.

10. Droit applicable
Les présentes conditions sont soumises au droit français.`,
    },
    confidentialite: {
        slug: 'confidentialite',
        title: 'Politique de confidentialité',
        eyebrow: 'Protection des données',
        description:
            'La politique de confidentialité explique quelles données sont traitées, pourquoi et dans quelles limites.',
        content: `SENED - Politique de confidentialité

1. Responsable du traitement
SENED agit en qualité de responsable du traitement pour les données collectées dans le cadre de la plateforme.

2. Données collectées
Les données traitées peuvent inclure les informations de compte, de facturation, d'entreprise ainsi que les données liées à l'utilisation du service.

3. Finalités
Les données sont utilisées pour fournir la plateforme, gérer les comptes, facturer les abonnements, répondre au support et sécuriser le service.

4. Base légale
Les traitements reposent selon les cas sur l'exécution du contrat, le respect d'obligations légales et l'intérêt légitime de sécurisation et d'amélioration du service.

5. Destinataires
Les données sont accessibles aux équipes habilitées de SENED et à ses sous-traitants techniques strictement nécessaires.

6. Conservation
Les données sont conservées pendant la durée nécessaire à la gestion du service et au respect des obligations légales.

7. Sécurité
SENED met en oeuvre des mesures techniques et organisationnelles raisonnables pour protéger les données.

8. Droits
Vous pouvez exercer vos droits d'accès, rectification, suppression et opposition en contactant le support de SENED.

9. Contact
Pour toute question relative à la confidentialité, contactez le support SENED.`,
    },
    'mentions-legales': {
        slug: 'mentions-legales',
        title: 'Mentions légales',
        eyebrow: 'Information légale',
        description:
            'Les mentions légales rassemblent les informations d’identification et de publication du service.',
        content: `SENED - Mentions légales

Éditeur du site
SENED

Contact
Pour toute demande, contactez le support à l'adresse contact@sened.fr.

Hébergement
Les informations d'hébergement et de publication sont communiquées sur demande lorsque cela est requis par la réglementation applicable.`,
    },
};
