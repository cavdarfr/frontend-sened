import type { Product } from '@/types';

type DiscountType = 'percentage' | 'fixed';

export interface ProductFormComparable {
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
    discount_value: number;
    discount_type: DiscountType;
}

export interface ProductCatalogLine extends ProductFormComparable {
    product_id: string;
}

export interface SingleRow<T> {
    type: 'single';
    index: number;
    item: T;
}

export interface MultiTaxGroup<T> {
    type: 'multi';
    productId: string;
    productName: string;
    startIndex: number;
    items: { index: number; item: T }[];
}

export type DisplayRow<T> = SingleRow<T> | MultiTaxGroup<T>;

const toNumberOrFallback = (value: unknown, fallback: number): number => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export function getCatalogProductLines(product: Product): ProductCatalogLine[] {
    if (product.has_multi_tax && product.tax_lines && product.tax_lines.length > 0) {
        return product.tax_lines.map((taxLine) => ({
            product_id: product.id,
            description: taxLine.label || product.name || '',
            quantity: 1,
            unit_price: toNumberOrFallback(taxLine.amount, 0),
            vat_rate: toNumberOrFallback(taxLine.tax_rate, 20),
            discount_value: 0,
            discount_type: 'percentage',
        }));
    }

    return [{
        product_id: product.id,
        description: product.name || '',
        quantity: 1,
        unit_price: toNumberOrFallback(product.unit_price, 0),
        vat_rate: toNumberOrFallback(product.vat_rate, 20),
        discount_value: 0,
        discount_type: 'percentage',
    }];
}

export function isItemMatchingCatalogLine<T extends ProductFormComparable>(
    item: T,
    catalogLine: ProductCatalogLine,
): boolean {
    return item.product_id === catalogLine.product_id
        && item.description === catalogLine.description
        && item.quantity === catalogLine.quantity
        && item.unit_price === catalogLine.unit_price
        && item.vat_rate === catalogLine.vat_rate
        && item.discount_value === catalogLine.discount_value
        && item.discount_type === catalogLine.discount_type;
}

export function isDraftItemForProductSelection<T extends ProductFormComparable>(
    item: T,
    defaultVatRate: number,
): boolean {
    return !item.product_id
        && item.description === ''
        && item.quantity === 1
        && item.unit_price === 0
        && item.vat_rate === defaultVatRate
        && item.discount_value === 0
        && item.discount_type === 'percentage';
}

export function findLastMergeableSingleItemIndex<T extends ProductFormComparable>(
    items: T[],
    product: Product,
    excludedIndex: number,
): number {
    const [catalogLine] = getCatalogProductLines(product);

    for (let i = items.length - 1; i >= 0; i--) {
        if (i === excludedIndex) continue;
        if (isItemMatchingCatalogLine(items[i], catalogLine)) {
            return i;
        }
    }

    return -1;
}

export function findTrailingMergeableMultiTaxGroup<T extends ProductFormComparable>(
    items: T[],
    product: Product,
    endExclusive: number,
): { startIndex: number; count: number } | null {
    const catalogLines = getCatalogProductLines(product);
    if (catalogLines.length <= 1 || endExclusive <= 0) {
        return null;
    }

    let startIndex = endExclusive;
    while (startIndex > 0 && items[startIndex - 1].product_id === product.id) {
        startIndex--;
    }

    if (startIndex === endExclusive) {
        return null;
    }

    const groupItems = items.slice(startIndex, endExclusive);
    if (groupItems.length % catalogLines.length !== 0) {
        return null;
    }

    for (let i = 0; i < groupItems.length; i++) {
        const expectedLine = catalogLines[i % catalogLines.length];
        if (!isItemMatchingCatalogLine(groupItems[i], expectedLine)) {
            return null;
        }
    }

    return {
        startIndex,
        count: groupItems.length,
    };
}

/**
 * Groups consecutive items with the same product_id when the product has has_multi_tax === true.
 * Used in edit forms where we have access to the products list.
 */
export function groupItemsForDisplay<T extends { product_id?: string }>(
    items: T[],
    products: Product[],
    getProductId: (item: T) => string | undefined = (item) => item.product_id,
): DisplayRow<T>[] {
    const rows: DisplayRow<T>[] = [];
    let i = 0;

    while (i < items.length) {
        const item = items[i];
        const productId = getProductId(item);

        if (productId) {
            const product = products.find(p => p.id === productId);
            if (product && product.has_multi_tax) {
                // Collect consecutive items with the same product_id
                const groupItems: { index: number; item: T }[] = [];
                let j = i;
                while (j < items.length && getProductId(items[j]) === productId) {
                    groupItems.push({ index: j, item: items[j] });
                    j++;
                }
                if (groupItems.length >= 2) {
                    rows.push({
                        type: 'multi',
                        productId,
                        productName: product.name,
                        startIndex: i,
                        items: groupItems,
                    });
                    i = j;
                    continue;
                }
            }
        }

        rows.push({ type: 'single', index: i, item });
        i++;
    }

    return rows;
}

/**
 * Groups consecutive items with the same product_id (2+ items = group).
 * Used in read-only views where we don't have the products list.
 */
export function groupItemsForReadOnly<T extends { product_id?: string }>(
    items: T[],
    getProductId: (item: T) => string | undefined = (item) => item.product_id,
): DisplayRow<T>[] {
    const rows: DisplayRow<T>[] = [];
    let i = 0;

    while (i < items.length) {
        const item = items[i];
        const productId = getProductId(item);

        if (productId) {
            // Collect consecutive items with the same product_id
            const groupItems: { index: number; item: T }[] = [];
            let j = i;
            while (j < items.length && getProductId(items[j]) === productId) {
                groupItems.push({ index: j, item: items[j] });
                j++;
            }
            if (groupItems.length >= 2) {
                // Use the first item's description or product name as group name
                const firstItem = items[i] as any;
                const productName = firstItem.product?.name || firstItem.description || 'Produit multi-taux';
                rows.push({
                    type: 'multi',
                    productId,
                    productName,
                    startIndex: i,
                    items: groupItems,
                });
                i = j;
                continue;
            }
        }

        rows.push({ type: 'single', index: i, item });
        i++;
    }

    return rows;
}
