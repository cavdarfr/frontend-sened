import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface ConfirmationDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
    open,
    onConfirm,
    onCancel,
    title,
    description,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'default',
}: ConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            variant === 'destructive' && buttonVariants({ variant: 'destructive' })
                        )}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
