import type { ThemeVariant } from '@/lib/styles/theme';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  theme?: ThemeVariant;
  variant?: LinkVariant;
}

type LinkVariant = 'primary' | 'secondary';

const linkClasses: Record<LinkVariant, Record<ThemeVariant, string>> = {
  primary: {
    dark: 'text-accent-cyan underline hover:text-accent-cyan-hover',
    light: 'text-blue-600 underline hover:text-blue-700',
  },
  secondary: {
    dark: 'text-white/50 underline hover:text-white/70',
    light: 'text-gray-600 underline hover:text-gray-700',
  },
};

export default function Link({
  children,
  className = '',
  theme = 'light',
  variant = 'primary',
  ...props
}: LinkProps) {
  const variantClass = linkClasses[variant][theme];

  return (
    <a className={`${variantClass} ${className}`} {...props}>
      {children}
    </a>
  );
}
