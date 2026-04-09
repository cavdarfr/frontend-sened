import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: number;
    title: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <nav aria-label="Progress" className={cn('w-full', className)}>
            <ol className="flex items-center justify-center">
                {steps.map((step, index) => (
                    <li
                        key={step.id}
                        className={cn(
                            'relative',
                            index !== steps.length - 1 && 'flex-1'
                        )}
                    >
                        <div className="flex items-center">
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                    step.id < currentStep
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : step.id === currentStep
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted-foreground/25 text-muted-foreground'
                                )}
                            >
                                {step.id < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-medium">{step.id}</span>
                                )}
                            </div>
                            <div className="ml-3 hidden sm:block">
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        step.id <= currentStep
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                            {index !== steps.length - 1 && (
                                <div
                                    className={cn(
                                        'ml-4 h-0.5 w-full',
                                        step.id < currentStep
                                            ? 'bg-primary'
                                            : 'bg-muted-foreground/25'
                                    )}
                                />
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
