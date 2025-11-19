import React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(className)}
      aria-disabled={disabled || loading}
      aria-label={loading ? loadingText : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only">{loadingText}</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
