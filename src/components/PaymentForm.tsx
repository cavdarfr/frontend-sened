import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe as StripeType } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<StripeType | null> | null = null;
const PAYMENT_ERROR_MESSAGE =
    "Le paiement n'a pas pu être finalisé. Vérifiez vos informations et réessayez.";
const PAYMENT_UNAVAILABLE_MESSAGE =
    "Le paiement est temporairement indisponible. Réessayez dans quelques instants.";

function getStripe() {
    if (!stripePromise && stripePublishableKey) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
}

function sanitizePaymentErrorMessage(message?: string | null): string {
    const trimmed = message?.trim();
    if (!trimmed) {
        return PAYMENT_ERROR_MESSAGE;
    }

    if (
        /stripe|vite_[a-z0-9_]+|api|json|html|backend|database|base de donn[ée]es|migration/i.test(
            trimmed,
        )
    ) {
        return PAYMENT_ERROR_MESSAGE;
    }

    return trimmed;
}

export interface PaymentFormBillingDetails {
    email?: string;
    name?: string;
    address?: {
        line1?: string;
        city?: string;
        postal_code?: string;
        country?: string;
    };
}

function cleanValue(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function sanitizeBillingDetails(
    billingDetails?: PaymentFormBillingDetails,
): PaymentFormBillingDetails | undefined {
    if (!billingDetails) {
        return undefined;
    }

    const address = {
        line1: cleanValue(billingDetails.address?.line1),
        city: cleanValue(billingDetails.address?.city),
        postal_code: cleanValue(billingDetails.address?.postal_code),
        country: cleanValue(billingDetails.address?.country),
    };

    const sanitized: PaymentFormBillingDetails = {
        email: cleanValue(billingDetails.email),
        name: cleanValue(billingDetails.name),
        address: Object.values(address).some(Boolean) ? address : undefined,
    };

    if (!sanitized.email && !sanitized.name && !sanitized.address) {
        return undefined;
    }

    return sanitized;
}

interface PaymentFormInnerProps {
    onSuccess: () => void;
    onError?: (message: string) => void;
    returnUrl: string;
    billingDetails?: PaymentFormBillingDetails;
}

function PaymentFormInner({ onSuccess, onError, returnUrl, billingDetails }: PaymentFormInnerProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const paymentElementKey = JSON.stringify(billingDetails || {});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(sanitizePaymentErrorMessage(submitError.message));
            setLoading(false);
            return;
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
            },
            redirect: 'if_required',
        });

        if (confirmError) {
            const msg = sanitizePaymentErrorMessage(confirmError.message);
            setError(msg);
            onError?.(msg);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            onSuccess();
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm font-medium">Paiement confirmé ! Activation en cours...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement
                key={paymentElementKey}
                options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['sepa_debit', 'card'],
                    defaultValues: billingDetails
                        ? {
                            billingDetails,
                        }
                        : undefined,
                }}
            />

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={!stripe || !elements || loading}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    'Confirmer le paiement'
                )}
            </Button>
        </form>
    );
}

interface PaymentFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onError?: (message: string) => void;
    returnUrl?: string;
    prefillBillingDetails?: PaymentFormBillingDetails;
}

export function PaymentForm({
    clientSecret,
    onSuccess,
    onError,
    returnUrl,
    prefillBillingDetails,
}: PaymentFormProps) {
    const stripe = getStripe();
    const billingDetails = sanitizeBillingDetails(prefillBillingDetails);

    if (!stripe) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {PAYMENT_UNAVAILABLE_MESSAGE}
            </div>
        );
    }

    const effectiveReturnUrl = returnUrl || `${window.location.origin}/settings?subscription=success`;

    return (
        <Elements
            stripe={stripe}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: 'hsl(222.2 47.4% 11.2%)',
                        borderRadius: '8px',
                    },
                },
                locale: 'fr',
            }}
        >
            <PaymentFormInner
                onSuccess={onSuccess}
                onError={onError}
                returnUrl={effectiveReturnUrl}
                billingDetails={billingDetails}
            />
        </Elements>
    );
}

export default PaymentForm;
