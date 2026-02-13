import { extractUTMParameters } from './extract-utm-parameters';

describe('extractUTMParameters', () => {
  it('should extract all UTM parameters', () => {
    const searchParams = new URLSearchParams(
      'utm_source=google&utm_medium=cpc&utm_campaign=summer&utm_term=tutoring&utm_content=ad1'
    );

    const result = extractUTMParameters(searchParams);

    expect(result).toEqual({
      utmCampaign: 'summer',
      utmContent: 'ad1',
      utmMedium: 'cpc',
      utmSource: 'google',
      utmTerm: 'tutoring',
    });
  });

  it('should return undefined for missing parameters', () => {
    const searchParams = new URLSearchParams('utm_source=google&utm_medium=cpc');

    const result = extractUTMParameters(searchParams);

    expect(result).toEqual({
      utmCampaign: undefined,
      utmContent: undefined,
      utmMedium: 'cpc',
      utmSource: 'google',
      utmTerm: undefined,
    });
  });

  it('should handle empty search params', () => {
    const searchParams = new URLSearchParams('');

    const result = extractUTMParameters(searchParams);

    expect(result).toEqual({
      utmCampaign: undefined,
      utmContent: undefined,
      utmMedium: undefined,
      utmSource: undefined,
      utmTerm: undefined,
    });
  });

  it('should handle URL encoded values', () => {
    const searchParams = new URLSearchParams('utm_campaign=hello%20world&utm_source=test%20source');

    const result = extractUTMParameters(searchParams);

    expect(result.utmCampaign).toBe('hello world');
    expect(result.utmSource).toBe('test source');
  });
});
