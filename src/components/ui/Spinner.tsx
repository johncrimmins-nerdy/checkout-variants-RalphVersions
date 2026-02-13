import type { ThemeVariant } from '@/lib/styles/theme';

interface SpinnerProps {
  className?: string;
  size?: SpinnerSize;
  theme?: ThemeVariant;
}

type SpinnerSize = 'lg' | 'md' | 'sm';

const sizeClasses: Record<SpinnerSize, string> = {
  lg: 'h-16 w-16 border-4',
  md: 'h-12 w-12 border-4',
  sm: 'h-5 w-5 border-2',
};

const themeClasses: Record<ThemeVariant, string> = {
  dark: 'border-white/20 border-t-accent-cyan',
  light: 'border-gray-200 border-t-brand-selection',
};

export default function Spinner({ className = '', size = 'md', theme = 'light' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${themeClasses[theme]} ${className}`}
    />
  );
}
