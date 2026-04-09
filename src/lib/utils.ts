import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec clsx et tailwind-merge
 * Utilisé par les composants shadcn/ui
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formate la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Vérifie si un fichier est une image valide
 */
export function isValidImageType(file: File): boolean {
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/svg+xml',
    ];
    return validTypes.includes(file.type);
}

/**
 * Génère un nom de fichier unique
 */
export function generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Déduplique une liste d'éléments possédant un id.
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
    const map = new Map<string, T>();

    items.forEach((item) => {
        map.set(item.id, item);
    });

    return Array.from(map.values());
}

/**
 * Ajoute ou remplace un élément dans une liste en se basant sur son id.
 */
export function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
    return dedupeById([...items, item]);
}
