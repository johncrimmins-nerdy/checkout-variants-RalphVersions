/**
 * Tests for format-phone utility
 */

import { formatPhone } from './format-phone';

describe('formatPhone', () => {
  it('formats 10-digit phone number correctly', () => {
    const result = formatPhone('1234567890');

    expect(result).toBe('(123) 456-7890');
  });

  it('formats 10-digit phone with existing formatting', () => {
    const result = formatPhone('123-456-7890');

    expect(result).toBe('(123) 456-7890');
  });

  it('formats 10-digit phone with parentheses', () => {
    const result = formatPhone('(123) 456-7890');

    expect(result).toBe('(123) 456-7890');
  });

  it('formats 11-digit phone starting with 1', () => {
    const result = formatPhone('11234567890');

    expect(result).toBe('(123) 456-7890');
  });

  it('formats 11-digit phone with country code prefix', () => {
    const result = formatPhone('+1 123 456 7890');

    expect(result).toBe('(123) 456-7890');
  });

  it('returns original for invalid length', () => {
    const result = formatPhone('12345');

    expect(result).toBe('12345');
  });

  it('returns original for 11-digit not starting with 1', () => {
    const result = formatPhone('21234567890');

    expect(result).toBe('21234567890');
  });

  it('handles empty string', () => {
    const result = formatPhone('');

    expect(result).toBe('');
  });

  it('handles phone with spaces', () => {
    const result = formatPhone('123 456 7890');

    expect(result).toBe('(123) 456-7890');
  });

  it('handles phone with dots', () => {
    const result = formatPhone('123.456.7890');

    expect(result).toBe('(123) 456-7890');
  });
});
