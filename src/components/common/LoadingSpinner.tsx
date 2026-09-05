import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={`inline-flex items-center justify-center gap-2 ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
