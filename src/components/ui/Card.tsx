import type { ThemeVariant } from '@/lib/styles/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  theme?: ThemeVariant;
  variant?: CardVariant;
}

type CardVariant = 'default' | 'inline';

const cardClasses: Record<CardVariant, Record<ThemeVariant, string>> = {
  default: {
    dark: 'rounded-xl border border-luminex-border-30 bg-luminex-card-50 p-5',
    light: 'rounded-xl border border-gray-200 bg-white p-5',
  },
  inline: {
    dark: 'mb-6 border-b border-white/10 pb-6',
    light: 'mb-6 border-b border-gray-200 pb-6',
  },
};

export default function Card({
  children,
  className = '',
  theme = 'light',
  variant = 'default',
}: CardProps) {
  const baseClass = cardClasses[variant][theme];

  return <div className={`${baseClass} ${className}`}>{children}</div>;
}
