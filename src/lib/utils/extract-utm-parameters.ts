/**
 * UTM parameter interface
 */
export interface UTMParameters {
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
}

/**
 * Extract UTM parameters from URL search params
 * @param searchParams - URL search params
 * @returns UTM parameters object
 */
export function extractUTMParameters(searchParams: URLSearchParams): UTMParameters {
  return {
    utmCampaign: searchParams.get('utm_campaign') ?? undefined,
    utmContent: searchParams.get('utm_content') ?? undefined,
    utmMedium: searchParams.get('utm_medium') ?? undefined,
    utmSource: searchParams.get('utm_source') ?? undefined,
    utmTerm: searchParams.get('utm_term') ?? undefined,
  };
}
