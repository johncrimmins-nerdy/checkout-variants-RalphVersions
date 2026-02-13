/**
 * Tests for cookie utility functions
 */

import { deleteCookie, getCookie, setCookie } from './cookie';

describe('cookie utilities', () => {
  beforeEach(() => {
    // Clear all cookies by setting them to expired
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  });

  describe('getCookie', () => {
    it('should return null when cookie does not exist', () => {
      expect(getCookie('nonexistent')).toBeNull();
    });

    it('should return cookie value when it exists', () => {
      document.cookie = 'test_cookie=test_value; path=/';
      expect(getCookie('test_cookie')).toBe('test_value');
    });

    it('should handle cookies with spaces', () => {
      document.cookie = 'spaced_cookie=value with spaces; path=/';
      expect(getCookie('spaced_cookie')).toBe('value with spaces');
    });

    it('should return correct cookie when multiple cookies exist', () => {
      document.cookie = 'cookie1=value1; path=/';
      document.cookie = 'cookie2=value2; path=/';
      document.cookie = 'cookie3=value3; path=/';

      expect(getCookie('cookie1')).toBe('value1');
      expect(getCookie('cookie2')).toBe('value2');
      expect(getCookie('cookie3')).toBe('value3');
    });

    it('should handle cookie names that are substrings of other names', () => {
      document.cookie = 'visitor_id=123; path=/';
      document.cookie = 'visitor_id_extended=456; path=/';

      expect(getCookie('visitor_id')).toBe('123');
      expect(getCookie('visitor_id_extended')).toBe('456');
    });

    it('should handle empty cookie value', () => {
      document.cookie = 'empty_cookie=; path=/';
      expect(getCookie('empty_cookie')).toBe('');
    });
  });

  describe('setCookie', () => {
    it('should set a cookie without expiration', () => {
      setCookie('new_cookie', 'new_value');
      expect(getCookie('new_cookie')).toBe('new_value');
    });

    it('should set a cookie with expiration', () => {
      setCookie('expiring_cookie', 'expiring_value', 7);
      expect(getCookie('expiring_cookie')).toBe('expiring_value');
    });

    it('should overwrite existing cookie', () => {
      setCookie('overwrite_cookie', 'original');
      expect(getCookie('overwrite_cookie')).toBe('original');

      setCookie('overwrite_cookie', 'updated');
      expect(getCookie('overwrite_cookie')).toBe('updated');
    });

    it('should set a cookie with domain', () => {
      // Note: This won't actually work in jsdom since domain must match
      // But we can verify it doesn't throw
      expect(() => setCookie('domain_cookie', 'value', 1, 'localhost')).not.toThrow();
    });
  });

  describe('deleteCookie', () => {
    it('should delete an existing cookie', () => {
      setCookie('to_delete', 'value');
      expect(getCookie('to_delete')).toBe('value');

      deleteCookie('to_delete');
      // After deletion with expired date, cookie value becomes empty
      // In jsdom, the cookie may still exist but with empty value
      const result = getCookie('to_delete');
      expect(result === '' || result === null).toBe(true);
    });

    it('should not throw when deleting non-existent cookie', () => {
      expect(() => deleteCookie('nonexistent_cookie')).not.toThrow();
    });
  });
});
