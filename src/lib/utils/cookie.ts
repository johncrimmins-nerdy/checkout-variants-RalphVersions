/**
 * Cookie utility functions
 */

import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Build a sanitized cookie header string from Next.js cookies
 * Removes non-ASCII characters that cause ByteString errors in fetch headers
 */
export function buildSanitizedCookieHeader(allCookies: RequestCookie[]): string {
  return allCookies
    .map((cookie) => {
      const sanitizedName = sanitizeForHeader(cookie.name);
      const sanitizedValue = sanitizeForHeader(cookie.value);
      const nameWasSanitized = sanitizedName !== cookie.name;
      const valueWasSanitized = sanitizedValue !== cookie.value;

      if (nameWasSanitized || valueWasSanitized) {
        const removedFromName = extractRemovedChars(cookie.name);
        const removedFromValue = extractRemovedChars(cookie.value);
        const totalCharsRemoved = removedFromName.length + removedFromValue.length;
        const originalTotalLength = cookie.name.length + cookie.value.length;
        const dataLossPercentage = ((totalCharsRemoved / originalTotalLength) * 100).toFixed(2);
        const characterTypes = Object.keys(
          categorizeRemovedChars([...removedFromName, ...removedFromValue])
        ).join(',');

        // Structured JSON log for New Relic parsing
        console.warn(
          JSON.stringify({
            characterTypes,
            cookieName: cookie.name,
            dataLossPercentage,
            environment: process.env.NEXT_PUBLIC_ENV || 'unknown',
            eventType: 'COOKIE_SANITIZATION',
            nameWasSanitized,
            originalValue: cookie.value,
            sanitizedValue,
            timestamp: new Date().toISOString(),
            totalCharsRemoved,
            valueWasSanitized,
          })
        );
      }

      return `${sanitizedName}=${sanitizedValue}`;
    })
    .join('; ');
}

/**
 * Delete a cookie
 * @param name - Cookie name
 * @param domain - Cookie domain (optional)
 */
export function deleteCookie(name: string, domain?: string): void {
  setCookie(name, '', -1, domain);
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): null | string {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration
 * @param domain - Cookie domain (optional)
 */
export function setCookie(name: string, value: string, days?: number, domain?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${value}${expires}${domainStr}; path=/`;
}

function categorizeRemovedChars(chars: Array<{ unicodeName: string }>): Record<string, number> {
  const categories: Record<string, number> = {};
  for (const char of chars) {
    categories[char.unicodeName] = (categories[char.unicodeName] || 0) + 1;
  }
  return categories;
}

function extractRemovedChars(
  value: string
): Array<{ char: string; charCode: number; position: number; unicodeName: string }> {
  const removed: Array<{ char: string; charCode: number; position: number; unicodeName: string }> =
    [];
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    if (charCode > 255) {
      removed.push({
        char: value[i],
        charCode,
        position: i,
        unicodeName: getUnicodeCharDescription(charCode),
      });
    }
  }
  return removed;
}

function getUnicodeCharDescription(charCode: number): string {
  if (charCode >= 0x2018 && charCode <= 0x201f) {
    const names: Record<number, string> = {
      0x2018: 'LEFT_SINGLE_QUOTATION_MARK',
      0x2019: 'RIGHT_SINGLE_QUOTATION_MARK',
      0x201a: 'SINGLE_LOW_9_QUOTATION_MARK',
      0x201b: 'SINGLE_HIGH_REVERSED_9_QUOTATION_MARK',
      0x201c: 'LEFT_DOUBLE_QUOTATION_MARK',
      0x201d: 'RIGHT_DOUBLE_QUOTATION_MARK',
      0x201e: 'DOUBLE_LOW_9_QUOTATION_MARK',
      0x201f: 'DOUBLE_HIGH_REVERSED_9_QUOTATION_MARK',
    };
    return names[charCode] || 'QUOTATION_MARK';
  }
  if (charCode >= 0x4e00 && charCode <= 0x9fff) return 'CJK_UNIFIED_IDEOGRAPH';
  if (charCode >= 0x3040 && charCode <= 0x309f) return 'HIRAGANA';
  if (charCode >= 0x30a0 && charCode <= 0x30ff) return 'KATAKANA';
  if (charCode >= 0xac00 && charCode <= 0xd7af) return 'HANGUL_SYLLABLE';
  if (charCode >= 0x0400 && charCode <= 0x04ff) return 'CYRILLIC';
  if (charCode >= 0x0600 && charCode <= 0x06ff) return 'ARABIC';
  if (charCode >= 0x0900 && charCode <= 0x097f) return 'DEVANAGARI';
  if (charCode >= 0x2000 && charCode <= 0x206f) return 'GENERAL_PUNCTUATION';
  if (charCode >= 0x2100 && charCode <= 0x214f) return 'LETTERLIKE_SYMBOL';
  if (charCode >= 0x2200 && charCode <= 0x22ff) return 'MATHEMATICAL_OPERATOR';
  if (charCode >= 0x1f300 && charCode <= 0x1f9ff) return 'EMOJI';
  return `UNICODE_U+${charCode.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * Sanitize a string to remove non-ASCII characters (codes > 255)
 * HTTP headers only support ByteString (0-255 char codes)
 */
function sanitizeForHeader(value: string): string {
  return value.replace(/[\u0100-\uFFFF]/g, '');
}
