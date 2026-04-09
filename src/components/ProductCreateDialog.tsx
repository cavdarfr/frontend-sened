import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import type { Product, ProductCategory } from '@/types';

interface ProductCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    onProductCreated: (product: Product) => void;
    initialName?: string;
    initialPrice?: number;
    initialCategories?: ProductCategory[];
}

/**
 * Composant simplifié pour créer un produit depuis les pages factures/devis
 * Utilise ProductFormDialog en interne
 */
export function ProductCreateDialog({
    open,
    onOpenChange,
    companyId,
    onProductCreated,
    initialCategories,
}: ProductCreateDialogProps) {
    return (
        <ProductFormDialog
            open={open}
            onOpenChange={onOpenChange}
            companyId={companyId}
            productToEdit={null}
            onSuccess={onProductCreated}
            initialCategories={initialCategories}
        />
    );
}
