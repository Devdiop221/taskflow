import React from 'react';
import { cn } from '../../lib/utils';
import { Label } from './label';

/**
 * Input component props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Reusable Input component with label and error support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <Label className="mb-1 block text-gray-700">
                        {label}
                    </Label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-border/70 bg-white px-4 text-sm placeholder:text-gray-400 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary/60 transition disabled:cursor-not-allowed disabled:opacity-60',
                        error && 'border-red-400 focus-visible:ring-red-200',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';