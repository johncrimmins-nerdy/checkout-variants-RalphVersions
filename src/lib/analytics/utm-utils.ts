/**
 * UTM parameter extraction utilities for analytics
 */

/**
 * Extracts UTM parameters from the current URL
 */
export function extractUtmParameters(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const key of utmKeys) {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

/**
 * Extracts quote context from URL parameters
 */
export function getQuoteContext(): Record<string, null | string> {
  if (typeof window === 'undefined') {
    return {
      lead_id: null,
      quote_id: null,
    };
  }

  const urlParams = new URLSearchParams(window.location.search);

  return {
    lead_id: urlParams.get('lead_id'),
    quote_id: urlParams.get('q'),
  };
}
