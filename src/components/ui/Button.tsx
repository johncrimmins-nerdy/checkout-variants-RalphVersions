'use client';

import type { ThemeVariant } from '@/lib/styles/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  theme?: ThemeVariant;
  variant?: ButtonVariant;
}

type ButtonVariant = 'back' | 'outline' | 'primary' | 'secondary';

const variantClasses: Record<ButtonVariant, Record<ThemeVariant, string>> = {
  back: {
    dark: 'flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300',
    light: 'flex items-center gap-2 text-sm text-blue-600 hover:underline',
  },
  outline: {
    dark: 'rounded-btn h-[54px] border px-6 bg-transparent border-white text-white hover:bg-white/10',
    light:
      'rounded-btn h-[54px] border px-6 bg-white border-gray-300 text-brand-text hover:bg-gray-50',
  },
  primary: {
    dark: 'rounded-pill px-6 py-4 font-semibold bg-accent-primary text-black hover:shadow-btn-dark disabled:bg-gray-300',
    light:
      'rounded-pill px-6 py-4 font-semibold bg-accent-primary text-black hover:shadow-btn-light disabled:bg-gray-300',
  },
  secondary: {
    dark: 'rounded-pill px-6 py-4 font-medium border bg-transparent border-white text-white hover:shadow-btn-dark',
    light:
      'rounded-pill px-6 py-4 font-medium border bg-white border-black text-brand-text hover:shadow-md',
  },
};

export default function Button({
  children,
  className = '',
  disabled,
  fullWidth = true,
  isLoading = false,
  loadingText,
  theme = 'light',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const baseClasses = 'transition-all disabled:cursor-not-allowed';
  const widthClass = fullWidth && variant !== 'back' ? 'w-full max-w-[400px]' : '';
  const variantClass = variantClasses[variant][theme];

  return (
    <button
      className={`${baseClasses} ${widthClass} ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (loadingText ?? 'Loading...') : children}
    </button>
  );
}
