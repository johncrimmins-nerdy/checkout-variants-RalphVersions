export type ThemeVariant = 'dark' | 'light';

export const themeClasses = {
  button: {
    back: {
      dark: 'text-blue-400 hover:text-blue-300',
      light: 'text-blue-600 hover:underline',
    },
    primary: {
      base: 'w-full rounded-pill px-6 py-4 font-semibold transition-all disabled:cursor-not-allowed disabled:bg-gray-300 bg-accent-primary text-black',
      hover: {
        dark: 'hover:shadow-btn-dark',
        light: 'hover:shadow-btn-light',
      },
    },
    secondary: {
      dark: 'bg-transparent border-white text-white hover:shadow-btn-dark',
      light: 'bg-white border-black text-brand-text hover:shadow-md',
    },
  },
  card: {
    container: {
      dark: 'border-luminex-border-30 bg-luminex-card-50',
      light: 'border-gray-200 bg-white',
    },
  },
  error: {
    container: {
      dark: 'border-red-400/50 bg-red-500/20',
      light: 'border-red-200 bg-red-50',
    },
    text: {
      dark: 'text-red-200',
      light: 'text-red-700',
    },
  },
  input: {
    base: {
      dark: 'border-white/30 bg-luminex-input text-white',
      light: 'border-gray-300 bg-white text-brand-text focus:border-gray-400',
    },
    disabled: {
      dark: 'border-white/30 bg-luminex-input',
      light: 'border-gray-300 bg-gray-100',
    },
  },
  link: {
    primary: {
      dark: 'text-accent-cyan hover:text-accent-cyan-hover',
      light: 'text-blue-600 hover:underline',
    },
    secondary: {
      dark: 'text-white/50 underline hover:text-white/70',
      light: 'text-gray-600 underline hover:text-gray-700',
    },
  },
  spinner: {
    dark: 'border-white/20 border-t-accent-cyan',
    light: 'border-gray-200 border-t-brand-selection',
  },
  text: {
    muted: {
      dark: 'text-white/40',
      light: 'text-gray-500',
    },
    primary: {
      dark: 'text-white',
      light: 'text-brand-text',
    },
    secondary: {
      dark: 'text-white/60',
      light: 'text-gray-600',
    },
  },
} as const;

export function getCardClasses(variant: ThemeVariant): string {
  return `rounded-xl border p-5 ${themeClasses.card.container[variant]}`;
}

export function getErrorClasses(variant: ThemeVariant): {
  container: string;
  text: string;
} {
  return {
    container: `rounded-lg border p-3 text-sm ${themeClasses.error.container[variant]}`,
    text: themeClasses.error.text[variant],
  };
}

export function getFloatingLabelWrapperClass(variant: ThemeVariant): string {
  return variant === 'dark'
    ? 'dynamic-input-label-wrapper luminex-wrapper'
    : 'dynamic-input-label-wrapper';
}

export function getInputClasses(variant: ThemeVariant, disabled = false): string {
  const base = 'h-input w-full rounded-lg border px-3 focus:outline-none';
  const state = disabled ? themeClasses.input.disabled[variant] : themeClasses.input.base[variant];
  return `${base} ${state}`;
}

export function getLinkClasses(
  variant: ThemeVariant,
  type: 'primary' | 'secondary' = 'primary'
): string {
  return themeClasses.link[type][variant];
}

export function getPrimaryButtonClasses(variant: ThemeVariant): string {
  const base = themeClasses.button.primary.base;
  const hover = themeClasses.button.primary.hover[variant];
  return `${base} ${hover}`;
}

export function getSpinnerClasses(variant: ThemeVariant, size: 'lg' | 'md' | 'sm' = 'md'): string {
  const sizeClasses = {
    lg: 'h-16 w-16 border-4',
    md: 'h-12 w-12 border-4',
    sm: 'h-5 w-5 border-2',
  };
  return `animate-spin rounded-full ${sizeClasses[size]} ${themeClasses.spinner[variant]}`;
}

export function getThemeClass<T extends keyof typeof themeClasses>(
  category: T,
  subcategory: keyof (typeof themeClasses)[T],
  variant: ThemeVariant
): string {
  const categoryObj = themeClasses[category];
  const subcategoryObj = categoryObj[subcategory] as Record<ThemeVariant, string>;
  return subcategoryObj[variant];
}
