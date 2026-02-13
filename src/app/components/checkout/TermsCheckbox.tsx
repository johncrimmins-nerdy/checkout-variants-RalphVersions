'use client';

import type { ThemeVariant } from '@/lib/styles/theme';

import { ELECTRONIC_POLICY_PAGE_URL, TERMS_OF_USE_PAGE_URL } from '@/lib/constants/urls';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: ThemeVariant;
}

const themeStyles: Record<ThemeVariant, { link: string; text: string }> = {
  dark: {
    link: 'text-accent-cyan underline hover:text-accent-cyan-hover',
    text: 'text-white/80',
  },
  light: {
    link: 'text-blue-600 underline hover:text-blue-700',
    text: 'text-gray-700',
  },
};

export default function TermsCheckbox({
  checked,
  onChange,
  variant = 'light',
}: TermsCheckboxProps) {
  const styles = themeStyles[variant];

  return (
    <label className="mb-6 flex w-full max-w-[400px] cursor-pointer items-start gap-3">
      <input
        checked={checked}
        className="track-input-checkbox mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        data-element_id="terms_of_use"
        data-element_type="input"
        data-input_type="checkbox"
        data-page_section="express_checkout"
        name="Agree-To-Terms-Checkbox"
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
      />
      <span className={`text-sm ${styles.text}`}>
        I agree to the{' '}
        <a
          className={`track-click ${styles.link}`}
          data-element_id="terms_of_use_link"
          data-element_type="link"
          data-page_section="express_checkout"
          href={TERMS_OF_USE_PAGE_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Terms of Customer Account Use
        </a>{' '}
        and{' '}
        <a
          className={`track-click ${styles.link}`}
          data-element_id="electronic_policy_link"
          data-element_type="link"
          data-page_section="express_checkout"
          href={ELECTRONIC_POLICY_PAGE_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Electronic Communication Policy
        </a>
      </span>
    </label>
  );
}
