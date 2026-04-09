const CLIENT_EMAIL_REQUIRED_MESSAGE = "L'email du client est requis";
const CLIENT_EMAIL_INVALID_MESSAGE = "L'email du client doit être une adresse email valide";
const CLIENT_EMAIL_MAX_LENGTH_MESSAGE =
    "L'email du client doit contenir au maximum 255 caractères";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeClientEmail(email: string | null | undefined): string {
    return email?.trim() || '';
}

export function getClientEmailValidationMessage(email: string | null | undefined): string | null {
    const normalizedEmail = normalizeClientEmail(email);

    if (!normalizedEmail) {
        return CLIENT_EMAIL_REQUIRED_MESSAGE;
    }

    if (normalizedEmail.length > 255) {
        return CLIENT_EMAIL_MAX_LENGTH_MESSAGE;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return CLIENT_EMAIL_INVALID_MESSAGE;
    }

    return null;
}
