/**
 * Tests for utm-utils
 * UTM parameter extraction utilities
 */

import { extractUtmParameters, getQuoteContext } from './utm-utils';

describe('extractUtmParameters', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        search: '',
      },
      writable: true,
    });
  });

  it('should extract all UTM parameters', () => {
    window.location.search =
      '?utm_source=google&utm_medium=cpc&utm_campaign=spring2024&utm_term=tutoring&utm_content=banner1';

    const result = extractUtmParameters();

    expect(result).toEqual({
      utm_campaign: 'spring2024',
      utm_content: 'banner1',
      utm_medium: 'cpc',
      utm_source: 'google',
      utm_term: 'tutoring',
    });
  });

  it('should return only present UTM parameters', () => {
    window.location.search = '?utm_source=facebook&utm_campaign=summer';

    const result = extractUtmParameters();

    expect(result).toEqual({
      utm_campaign: 'summer',
      utm_source: 'facebook',
    });
    expect(result.utm_medium).toBeUndefined();
    expect(result.utm_term).toBeUndefined();
    expect(result.utm_content).toBeUndefined();
  });

  it('should return empty object when no UTM parameters', () => {
    window.location.search = '?q=quote123&lead_id=lead456';

    const result = extractUtmParameters();

    expect(result).toEqual({});
  });

  it('should handle empty search string', () => {
    window.location.search = '';

    const result = extractUtmParameters();

    expect(result).toEqual({});
  });

  it('should handle mixed parameters', () => {
    window.location.search = '?utm_source=email&lead_id=123&utm_medium=newsletter';

    const result = extractUtmParameters();

    expect(result).toEqual({
      utm_medium: 'newsletter',
      utm_source: 'email',
    });
    // Non-UTM params should not be included
    expect(result).not.toHaveProperty('lead_id');
  });

  it('should handle URL-encoded UTM values', () => {
    window.location.search = '?utm_source=google&utm_campaign=spring%202024';

    const result = extractUtmParameters();

    expect(result.utm_campaign).toBe('spring 2024');
  });
});

describe('getQuoteContext', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        search: '',
      },
      writable: true,
    });
  });

  it('should extract lead_id and quote_id from URL', () => {
    window.location.search = '?lead_id=lead-123&q=quote-456';

    const result = getQuoteContext();

    expect(result).toEqual({
      lead_id: 'lead-123',
      quote_id: 'quote-456',
    });
  });

  it('should return nulls when parameters are missing', () => {
    window.location.search = '?catalogItemId=item123';

    const result = getQuoteContext();

    expect(result).toEqual({
      lead_id: null,
      quote_id: null,
    });
  });

  it('should handle partial parameters', () => {
    window.location.search = '?q=quote-only';

    const result = getQuoteContext();

    expect(result).toEqual({
      lead_id: null,
      quote_id: 'quote-only',
    });
  });

  it('should handle empty search string', () => {
    window.location.search = '';

    const result = getQuoteContext();

    expect(result).toEqual({
      lead_id: null,
      quote_id: null,
    });
  });
});
