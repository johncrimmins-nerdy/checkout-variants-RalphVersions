import type { ThemeVariant } from '@/lib/styles/theme';

interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
  theme?: ThemeVariant;
}

const errorClasses: Record<ThemeVariant, { container: string; text: string }> = {
  dark: {
    container: 'border-red-400/50 bg-red-500/20',
    text: 'text-red-200',
  },
  light: {
    container: 'border-red-200 bg-red-50',
    text: 'text-red-700',
  },
};

export default function ErrorMessage({
  children,
  className = '',
  theme = 'light',
}: ErrorMessageProps) {
  const { container, text } = errorClasses[theme];

  return (
    <div className={`rounded-lg border p-3 text-sm ${container} ${className}`}>
      <p className={text}>{children}</p>
    </div>
  );
}
