/**
 * Tests for constants
 * Ensures all constants are properly exported and have expected structure
 */

import { AMPLITUDE_API_KEYS, LAUNCHDARKLY_CLIENT_IDS } from './api-keys';
import { FLAGS } from './flags';
import { PACKAGE_ITEM_TYPE_IDS } from './package-item-type-ids';

describe('API Keys Constants', () => {
  describe('AMPLITUDE_API_KEYS', () => {
    it('should have production and staging keys', () => {
      expect(AMPLITUDE_API_KEYS).toHaveProperty('PRODUCTION');
      expect(AMPLITUDE_API_KEYS).toHaveProperty('STAGING');
      expect(typeof AMPLITUDE_API_KEYS.PRODUCTION).toBe('string');
      expect(typeof AMPLITUDE_API_KEYS.STAGING).toBe('string');
    });

    it('should have different keys for each environment', () => {
      expect(AMPLITUDE_API_KEYS.PRODUCTION).not.toBe(AMPLITUDE_API_KEYS.STAGING);
    });
  });

  describe('LAUNCHDARKLY_CLIENT_IDS', () => {
    it('should have production and staging client IDs', () => {
      expect(LAUNCHDARKLY_CLIENT_IDS).toHaveProperty('PRODUCTION');
      expect(LAUNCHDARKLY_CLIENT_IDS).toHaveProperty('STAGING');
      expect(typeof LAUNCHDARKLY_CLIENT_IDS.PRODUCTION).toBe('string');
      expect(typeof LAUNCHDARKLY_CLIENT_IDS.STAGING).toBe('string');
    });

    it('should have different IDs for each environment', () => {
      expect(LAUNCHDARKLY_CLIENT_IDS.PRODUCTION).not.toBe(LAUNCHDARKLY_CLIENT_IDS.STAGING);
    });
  });
});

describe('FLAGS Constants', () => {
  it('should export all feature flags', () => {
    expect(FLAGS).toHaveProperty('ECOMM_587');
    expect(FLAGS).toHaveProperty('ECOMM_614_LEAD_RESUBMISSION');
    expect(FLAGS).toHaveProperty('ECOMM_682_NEW_CHECKOUT_PROMO_CODES');
    expect(FLAGS).toHaveProperty('ECOMM_685_AI_PERSONALIZED');
    expect(FLAGS).toHaveProperty('ECOMM_771_RETARGETING');
    expect(FLAGS).toHaveProperty('ECOMM_827_CHURNED_CLIENT_PROMOCODE');
    expect(FLAGS).toHaveProperty('ECOMM_829_LUMINEX_THEME');
  });

  it('should have string values for all flags', () => {
    Object.values(FLAGS).forEach((flag) => {
      expect(typeof flag).toBe('string');
      expect(flag.length).toBeGreaterThan(0);
    });
  });

  it('should have ECOMM prefix for all flags', () => {
    Object.values(FLAGS).forEach((flag) => {
      expect(flag).toMatch(/^ECOMM-/);
    });
  });
});

describe('PACKAGE_ITEM_TYPE_IDS', () => {
  it('should be an array of numbers', () => {
    expect(Array.isArray(PACKAGE_ITEM_TYPE_IDS)).toBe(true);
    PACKAGE_ITEM_TYPE_IDS.forEach((id) => {
      expect(typeof id).toBe('number');
    });
  });

  it('contains expected package item type IDs', () => {
    expect(PACKAGE_ITEM_TYPE_IDS).toEqual([12, 22, 23, 24]);
  });

  it('should have non-empty array', () => {
    expect(PACKAGE_ITEM_TYPE_IDS.length).toBeGreaterThan(0);
  });
});
