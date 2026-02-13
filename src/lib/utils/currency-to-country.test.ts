/**
 * Tests for currency-to-country utility
 */

import { currencyToCountryMap, getCountryFromCurrency } from './currency-to-country';

describe('currencyToCountryMap', () => {
  it('maps USD to US', () => {
    expect(currencyToCountryMap.USD).toBe('US');
  });

  it('maps CAD to CA', () => {
    expect(currencyToCountryMap.CAD).toBe('CA');
  });

  it('maps GBP to GB', () => {
    expect(currencyToCountryMap.GBP).toBe('GB');
  });
});

describe('getCountryFromCurrency', () => {
  it('returns US for USD', () => {
    const result = getCountryFromCurrency('USD');

    expect(result).toBe('US');
  });

  it('returns CA for CAD', () => {
    const result = getCountryFromCurrency('CAD');

    expect(result).toBe('CA');
  });

  it('returns GB for GBP', () => {
    const result = getCountryFromCurrency('GBP');

    expect(result).toBe('GB');
  });

  it('returns US for undefined currency', () => {
    const result = getCountryFromCurrency(undefined);

    expect(result).toBe('US');
  });

  it('returns US for unknown currency', () => {
    const result = getCountryFromCurrency('EUR');

    expect(result).toBe('US');
  });

  it('returns US for empty string', () => {
    const result = getCountryFromCurrency('');

    expect(result).toBe('US');
  });
});
