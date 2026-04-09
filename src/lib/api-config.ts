const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

/**
 * Returns API base URL from env.
 * If missing, fall back to current origin to support same-domain deployments.
 */
export function getApiBaseUrl(): string {
    const trimmed = rawApiUrl?.trim();
    if (trimmed) {
        return trimmed.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin.replace(/\/+$/, '');
    }

    return '';
}

export function buildApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiBaseUrl()}${normalizedPath}`;
}
