import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  loadingText,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'border-none rounded-lg font-semibold cursor-pointer transition-all disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-60',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 hover:-translate-y-0.5 active:translate-y-0',
    danger: 'bg-red-500 text-white hover:bg-red-600 transition-colors'
  };

  const sizeClasses = {
    primary: 'px-4 py-3.5 text-base',
    secondary: 'px-6 py-2.5 text-sm',
    danger: 'px-4 py-2 text-sm'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass = variant === 'primary' ? sizeClasses.primary : variant === 'danger' ? sizeClasses.danger : sizeClasses.secondary;
  
  const specialClasses = variant === 'primary' && fullWidth ? 'py-4 text-lg hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClass} ${widthClass} ${specialClasses} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (loadingText || children) : children}
    </button>
  );
};

export default Button;

