import { currencySymbol } from './currency-symbol';

describe('currencySymbol', () => {
  it('should return $ for USD', () => {
    expect(currencySymbol('USD')).toBe('$');
  });

  it('should return CA$ for CAD', () => {
    expect(currencySymbol('CAD')).toBe('CA$');
  });

  it('should return £ for GBP', () => {
    expect(currencySymbol('GBP')).toBe('£');
  });

  it('should default to $ for undefined', () => {
    expect(currencySymbol(undefined)).toBe('$');
  });

  it('should default to $ for empty string', () => {
    expect(currencySymbol('')).toBe('$');
  });

  it('should default to $ for unknown currency codes', () => {
    expect(currencySymbol('EUR')).toBe('$');
    expect(currencySymbol('JPY')).toBe('$');
    expect(currencySymbol('INVALID')).toBe('$');
  });

  it('should be case-sensitive (currency codes are uppercase)', () => {
    // Currency codes should be uppercase per ISO 4217
    expect(currencySymbol('usd')).toBe('$'); // Falls back to default
    expect(currencySymbol('cad')).toBe('$'); // Falls back to default
  });
});
