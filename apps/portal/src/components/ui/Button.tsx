import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' &&
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
          variant === 'secondary' &&
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
          variant === 'outline' &&
            'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500',
          variant === 'ghost' &&
            'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-6 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
