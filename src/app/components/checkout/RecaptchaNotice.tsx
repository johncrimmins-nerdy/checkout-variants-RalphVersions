import type { ThemeVariant } from '@/lib/styles/theme';

interface RecaptchaNoticeProps {
  variant?: ThemeVariant;
}

const themeStyles: Record<ThemeVariant, { link: string; text: string }> = {
  dark: {
    link: 'text-white/50 underline hover:text-white/70',
    text: 'text-white/40',
  },
  light: {
    link: 'text-gray-600 underline hover:text-gray-700',
    text: 'text-gray-500',
  },
};

export default function RecaptchaNotice({ variant = 'light' }: RecaptchaNoticeProps) {
  const styles = themeStyles[variant];

  return (
    <p className={`mt-4 w-full max-w-[400px] text-xs font-normal ${styles.text}`}>
      This site is protected by reCAPTCHA and the Google{' '}
      <a
        className={styles.link}
        href="https://policies.google.com/privacy"
        rel="noopener noreferrer"
        target="_blank"
      >
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        className={styles.link}
        href="https://policies.google.com/terms"
        rel="noopener noreferrer"
        target="_blank"
      >
        Terms of Service
      </a>{' '}
      apply.
    </p>
  );
}
