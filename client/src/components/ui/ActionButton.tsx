import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant: 'primary' | 'success' | 'danger';
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  disabled = false, 
  isLoading = false, 
  variant, 
  children, 
  loadingText,
  className = ''
}) => {
  const getVariantClasses = (variant: string): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'primary':
      default:
        return 'bg-red-500 text-white hover:bg-red-600';
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : getVariantClasses(variant)
      } ${className}`}
    >
      {isLoading ? loadingText || 'טוען...' : children}
    </button>
  );
};
