/**
 * Tests for theme style utilities
 */

import {
  getCardClasses,
  getErrorClasses,
  getFloatingLabelWrapperClass,
  getInputClasses,
  getLinkClasses,
  getPrimaryButtonClasses,
  getSpinnerClasses,
  getThemeClass,
  themeClasses,
} from './theme';

describe('themeClasses', () => {
  it('exports button styles', () => {
    expect(themeClasses.button).toBeDefined();
    expect(themeClasses.button.primary).toBeDefined();
    expect(themeClasses.button.secondary).toBeDefined();
  });

  it('exports card styles', () => {
    expect(themeClasses.card.container.dark).toBeDefined();
    expect(themeClasses.card.container.light).toBeDefined();
  });

  it('exports error styles', () => {
    expect(themeClasses.error.container.dark).toBeDefined();
    expect(themeClasses.error.text.light).toBeDefined();
  });

  it('exports input styles', () => {
    expect(themeClasses.input.base.dark).toBeDefined();
    expect(themeClasses.input.disabled.light).toBeDefined();
  });
});

describe('getPrimaryButtonClasses', () => {
  it('returns base classes plus dark hover for dark variant', () => {
    const result = getPrimaryButtonClasses('dark');

    expect(result).toContain(themeClasses.button.primary.base);
    expect(result).toContain(themeClasses.button.primary.hover.dark);
  });

  it('returns base classes plus light hover for light variant', () => {
    const result = getPrimaryButtonClasses('light');

    expect(result).toContain(themeClasses.button.primary.base);
    expect(result).toContain(themeClasses.button.primary.hover.light);
  });
});

describe('getCardClasses', () => {
  it('returns dark card classes', () => {
    const result = getCardClasses('dark');

    expect(result).toContain('rounded-xl');
    expect(result).toContain('border');
    expect(result).toContain(themeClasses.card.container.dark);
  });

  it('returns light card classes', () => {
    const result = getCardClasses('light');

    expect(result).toContain('rounded-xl');
    expect(result).toContain(themeClasses.card.container.light);
  });
});

describe('getErrorClasses', () => {
  it('returns dark error classes', () => {
    const result = getErrorClasses('dark');

    expect(result.container).toContain('rounded-lg');
    expect(result.container).toContain(themeClasses.error.container.dark);
    expect(result.text).toBe(themeClasses.error.text.dark);
  });

  it('returns light error classes', () => {
    const result = getErrorClasses('light');

    expect(result.container).toContain(themeClasses.error.container.light);
    expect(result.text).toBe(themeClasses.error.text.light);
  });
});

describe('getInputClasses', () => {
  it('returns normal input classes for dark variant', () => {
    const result = getInputClasses('dark');

    expect(result).toContain('h-input');
    expect(result).toContain('w-full');
    expect(result).toContain(themeClasses.input.base.dark);
  });

  it('returns normal input classes for light variant', () => {
    const result = getInputClasses('light');

    expect(result).toContain(themeClasses.input.base.light);
  });

  it('returns disabled input classes when disabled', () => {
    const result = getInputClasses('light', true);

    expect(result).toContain(themeClasses.input.disabled.light);
  });
});

describe('getLinkClasses', () => {
  it('returns primary link classes by default', () => {
    const result = getLinkClasses('light');

    expect(result).toBe(themeClasses.link.primary.light);
  });

  it('returns secondary link classes when specified', () => {
    const result = getLinkClasses('dark', 'secondary');

    expect(result).toBe(themeClasses.link.secondary.dark);
  });
});

describe('getFloatingLabelWrapperClass', () => {
  it('returns luminex wrapper for dark variant', () => {
    const result = getFloatingLabelWrapperClass('dark');

    expect(result).toContain('luminex-wrapper');
  });

  it('returns base wrapper for light variant', () => {
    const result = getFloatingLabelWrapperClass('light');

    expect(result).toBe('dynamic-input-label-wrapper');
    expect(result).not.toContain('luminex');
  });
});

describe('getSpinnerClasses', () => {
  it('returns dark spinner classes', () => {
    const result = getSpinnerClasses('dark');

    expect(result).toContain('animate-spin');
    expect(result).toContain(themeClasses.spinner.dark);
  });

  it('returns light spinner classes', () => {
    const result = getSpinnerClasses('light');

    expect(result).toContain(themeClasses.spinner.light);
  });

  it('returns medium size by default', () => {
    const result = getSpinnerClasses('light');

    expect(result).toContain('h-12');
    expect(result).toContain('w-12');
  });

  it('returns small size when specified', () => {
    const result = getSpinnerClasses('light', 'sm');

    expect(result).toContain('h-5');
    expect(result).toContain('w-5');
  });

  it('returns large size when specified', () => {
    const result = getSpinnerClasses('light', 'lg');

    expect(result).toContain('h-16');
    expect(result).toContain('w-16');
  });
});

describe('getThemeClass', () => {
  it('returns correct class for category and subcategory', () => {
    const result = getThemeClass('text', 'primary', 'dark');

    expect(result).toBe(themeClasses.text.primary.dark);
  });

  it('returns muted text class', () => {
    const result = getThemeClass('text', 'muted', 'light');

    expect(result).toBe(themeClasses.text.muted.light);
  });
});
