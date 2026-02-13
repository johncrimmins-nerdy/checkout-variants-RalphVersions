'use client';

import type { ThemeVariant } from '@/lib/styles/theme';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: boolean;
  label: string;
  theme?: ThemeVariant;
}

export default function Input({ error = false, label, theme = 'light', ...props }: InputProps) {
  const isDark = theme === 'dark';

  const wrapperClass = isDark
    ? 'dynamic-input-label-wrapper luminex-wrapper'
    : 'dynamic-input-label-wrapper';

  const inputClasses = isDark
    ? 'h-input w-full rounded-lg border px-3 text-white focus:outline-none'
    : `h-input w-full rounded-lg border border-gray-300 bg-white px-3 text-brand-text focus:border-gray-400 focus:outline-none ${
        error ? 'border-red-500' : ''
      }`;

  return (
    <div className={wrapperClass}>
      <input
        className={`track-input track-input-focusin track-input-focusout ${inputClasses}`}
        placeholder=" "
        {...props}
      />
      <label>{label}</label>
    </div>
  );
}
