/**
 * Tests for vt-analytics
 * VT Analytics service - Segment and VT Events integration
 */

// Define mock storage that can be accessed by mock implementations
const mockStorage = {
  identify: jest.fn(),
  interactionTrack: jest.fn(() => Promise.resolve()),
  loadSegment: jest.fn(() => Promise.resolve()),
  page: jest.fn(),
  track: jest.fn(),
  user: jest.fn(() => ({
    anonymousId: jest.fn(() => 'anon-123'),
  })),
};

// Mock segment-loader
jest.mock('./segment-loader', () => ({
  getSegmentAnalytics: () => ({
    identify: mockStorage.identify,
    page: mockStorage.page,
    track: mockStorage.track,
    user: mockStorage.user,
  }),
  loadSegment: () => mockStorage.loadSegment(),
}));

// Mock config
jest.mock('./config', () => ({
  APPLICATION_ID: 'test-app-id',
  getVTEventsEndpoint: () => 'https://events.test.com',
  isProduction: () => false,
}));

// Mock @varsitytutors/event-tracker
jest.mock('@varsitytutors/event-tracker', () => ({
  Interaction: jest.fn().mockImplementation(() => ({
    track: mockStorage.interactionTrack,
  })),
}));

// Import after mocks
import { vtAnalytics } from './vt-analytics';

describe('vtAnalytics', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset the initialized state
    // @ts-expect-error - accessing private property for testing
    vtAnalytics.initialized = false;
    // @ts-expect-error - accessing private property for testing
    vtAnalytics.vtEventInteraction = null;
    // @ts-expect-error - accessing private property for testing
    vtAnalytics.sessionId = '';

    // Setup localStorage mock
    const localStorageMock = {
      getItem: jest.fn(() => null),
      removeItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageMock,
      writable: true,
    });

    // Mock crypto.randomUUID
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: {
        randomUUID: jest.fn(() => 'test-uuid-123'),
      },
      writable: true,
    });
  });

  describe('isInitialized', () => {
    it('should return false before init', () => {
      expect(vtAnalytics.isInitialized()).toBe(false);
    });

    it('should return true after init', async () => {
      await vtAnalytics.init();
      expect(vtAnalytics.isInitialized()).toBe(true);
    });
  });

  describe('init', () => {
    it('should initialize analytics services', async () => {
      await vtAnalytics.init();
      expect(vtAnalytics.isInitialized()).toBe(true);
    });

    it('should generate session ID', async () => {
      await vtAnalytics.init();

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'webflow-checkout-session-id',
        'test-uuid-123'
      );
    });

    it('should use existing session ID if available', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('existing-session-id');

      await vtAnalytics.init();

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('identify', () => {
    it('should identify user in Segment', async () => {
      await vtAnalytics.init();
      vtAnalytics.identify('user-123');

      expect(mockStorage.identify).toHaveBeenCalledWith('user-123');
    });

    it('should handle null userId', async () => {
      await vtAnalytics.init();
      vtAnalytics.identify(null);

      expect(mockStorage.identify).toHaveBeenCalledWith(null);
    });
  });

  describe('track', () => {
    it('should track event to Segment', async () => {
      await vtAnalytics.init();
      vtAnalytics.track('Button Clicked', 'interactions', { button_id: 'submit' });

      expect(mockStorage.track).toHaveBeenCalledWith('Button Clicked', { button_id: 'submit' });
    });

    it('should use default category', async () => {
      await vtAnalytics.init();
      vtAnalytics.track('Test Event');

      expect(mockStorage.track).toHaveBeenCalledWith('Test Event', undefined);
    });
  });

  describe('page', () => {
    it('should track page view to Segment', async () => {
      await vtAnalytics.init();
      vtAnalytics.page({ page_name: 'Checkout' });

      expect(mockStorage.page).toHaveBeenCalledWith({ page_name: 'Checkout' });
    });

    it('should handle empty args', async () => {
      await vtAnalytics.init();
      vtAnalytics.page();

      expect(mockStorage.page).toHaveBeenCalledWith({});
    });
  });

  describe('getAnonymousId', () => {
    it('should return anonymous ID from Segment', async () => {
      await vtAnalytics.init();
      const anonId = await vtAnalytics.getAnonymousId();

      expect(anonId).toBe('anon-123');
    });
  });

  describe('vtEventTrack', () => {
    it('should track event to VT Events API', async () => {
      await vtAnalytics.init();

      vtAnalytics.vtEventTrack('Custom Event', 'custom_events', { custom: 'data' });

      expect(mockStorage.interactionTrack).toHaveBeenCalledWith(
        'Custom Event',
        expect.objectContaining({
          category: 'custom_events',
          dataAttributes: { custom: 'data' },
          target: 'page',
        })
      );
    });
  });
});
