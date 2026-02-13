/**
 * Tests for format-price utility
 */

import { formatPrice, formatPriceWithCents } from './format-price';

describe('formatPrice', () => {
  it('formats whole dollar amounts without decimals', () => {
    const result = formatPrice(5000);

    expect(result).toBe('50');
  });

  it('formats prices with cents', () => {
    const result = formatPrice(5099);

    expect(result).toBe('50.99');
  });

  it('handles zero', () => {
    const result = formatPrice(0);

    expect(result).toBe('0');
  });

  it('handles single digit cents', () => {
    const result = formatPrice(5001);

    expect(result).toBe('50.01');
  });

  it('handles large amounts', () => {
    const result = formatPrice(100000);

    expect(result).toBe('1000');
  });

  it('handles large amounts with cents', () => {
    const result = formatPrice(100099);

    expect(result).toBe('1000.99');
  });

  it('formats 1 cent correctly', () => {
    const result = formatPrice(1);

    expect(result).toBe('0.01');
  });

  it('formats 99 cents correctly', () => {
    const result = formatPrice(99);

    expect(result).toBe('0.99');
  });

  it('formats $1.00 without decimals', () => {
    const result = formatPrice(100);

    expect(result).toBe('1');
  });
});

describe('formatPriceWithCents', () => {
  it('formats whole dollar amounts with cents', () => {
    const result = formatPriceWithCents(5000);

    expect(result).toBe('50.00');
  });

  it('formats prices with cents', () => {
    const result = formatPriceWithCents(5099);

    expect(result).toBe('50.99');
  });
});
