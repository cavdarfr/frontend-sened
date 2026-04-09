import * as React from 'react';
import { Input } from '@/components/ui/input';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    value: number;
    onValueChange: (value: number) => void;
}

const normalizeForParse = (value: string) => value.replace(',', '.');
const normalizeForDisplay = (value: string) => value.replace(/\./g, ',');

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
    ({ value, onValueChange, onBlur, onFocus, ...props }, ref) => {
        const [rawValue, setRawValue] = React.useState<string>(String(value));
        const [isFocused, setIsFocused] = React.useState(false);

        React.useEffect(() => {
            if (!isFocused) {
                setRawValue(String(value));
            }
        }, [value, isFocused]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const displayedValue = normalizeForDisplay(e.target.value);
            setRawValue(displayedValue);

            if (displayedValue === '') return;

            const parsed = parseFloat(normalizeForParse(displayedValue));
            if (!Number.isNaN(parsed)) {
                onValueChange(parsed);
            }
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            if (rawValue.trim() === '') {
                onValueChange(0);
                setRawValue('0');
            } else {
                const parsed = parseFloat(normalizeForParse(rawValue));
                if (!Number.isNaN(parsed)) {
                    onValueChange(parsed);
                    setRawValue(normalizeForDisplay(String(parsed)));
                }
            }
            onBlur?.(e);
        };

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="decimal"
                value={rawValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            />
        );
    },
);

NumericInput.displayName = 'NumericInput';
