/**
 * @jest-environment jsdom
 */

/**
 * Tests for Segment analytics loader
 */

import { getSegmentAnalytics, loadSegment, waitForSegment } from './segment-loader';

// Mock config
jest.mock('./config', () => ({
  getSegmentKey: () => 'test-segment-key',
}));

describe('segment-loader', () => {
  beforeEach(() => {
    // Reset window.analytics
    delete (window as { analytics?: unknown }).analytics;
  });

  describe('getSegmentAnalytics', () => {
    it('returns null when analytics not loaded', () => {
      const result = getSegmentAnalytics();

      expect(result).toBeNull();
    });

    it('returns analytics instance when loaded', () => {
      const mockAnalytics = { track: jest.fn() };
      (window as { analytics?: unknown }).analytics = mockAnalytics;

      const result = getSegmentAnalytics();

      expect(result).toBe(mockAnalytics);
    });
  });

  describe('loadSegment', () => {
    it('resolves if already initialized', async () => {
      const mockAnalytics = { initialize: true };
      (window as { analytics?: unknown }).analytics = mockAnalytics;

      await expect(loadSegment()).resolves.toBeUndefined();
    });

    it('returns a promise', () => {
      // Mark analytics as already initialized to get immediate resolution
      (window as { analytics?: { initialize?: boolean } }).analytics = { initialize: true };

      const result = loadSegment();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('waitForSegment', () => {
    it('calls ready callback when available', async () => {
      const readyCallback = jest.fn((cb: () => void) => cb());
      const mockAnalytics = {
        initialize: true,
        ready: readyCallback,
      };
      (window as { analytics?: unknown }).analytics = mockAnalytics;

      const result = await waitForSegment();

      expect(readyCallback).toHaveBeenCalled();
      expect(result).toBe(mockAnalytics);
    });

    it('returns analytics when ready not available', async () => {
      const mockAnalytics = { initialize: true };
      (window as { analytics?: unknown }).analytics = mockAnalytics;

      const result = await waitForSegment();

      expect(result).toBe(mockAnalytics);
    });
  });
});
