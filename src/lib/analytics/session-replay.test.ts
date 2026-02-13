/**
 * @jest-environment jsdom
 */

// Mock @amplitude/session-replay-browser
const mockInit = jest.fn().mockResolvedValue(undefined);
const mockGetSessionReplayProperties = jest.fn();
const mockSetSessionId = jest.fn();
jest.mock('@amplitude/session-replay-browser', () => ({
  getSessionReplayProperties: () => mockGetSessionReplayProperties(),
  init: (...args: unknown[]) => mockInit(...args),
  setSessionId: (id: number) => mockSetSessionId(id),
}));

// Mock config
const mockGetSessionReplayConfig = jest.fn();
jest.mock('./config', () => ({
  getSessionReplayConfig: () => mockGetSessionReplayConfig(),
}));

// Mock segment-loader
const mockWaitForSegment = jest.fn();
const mockGetSegmentAnalytics = jest.fn();
jest.mock('./segment-loader', () => ({
  getSegmentAnalytics: () => mockGetSegmentAnalytics(),
  waitForSegment: () => mockWaitForSegment(),
}));

describe('SessionReplayService', () => {
  const mockSegment = {
    addSourceMiddleware: jest.fn(),
    user: jest.fn().mockReturnValue({
      anonymousId: jest.fn().mockReturnValue('test-anonymous-id'),
    }),
  };

  // We need to reset the module before each test to get a fresh singleton
  let sessionReplayService: typeof import('./session-replay').sessionReplayService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Default config: enabled
    mockGetSessionReplayConfig.mockReturnValue({
      apiKey: 'test-api-key',
      enabled: true,
      sampleRate: 1.0,
    });

    mockWaitForSegment.mockResolvedValue(mockSegment);
    mockGetSegmentAnalytics.mockReturnValue(mockSegment);
    mockGetSessionReplayProperties.mockReturnValue({
      '[Amplitude]Session Replay ID': 'test-replay-id',
    });

    // Reset cookies
    document.cookie = 'analytics_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Import fresh module
    const sessionReplayModule = await import('./session-replay');
    sessionReplayService = sessionReplayModule.sessionReplayService;
  });

  describe('getSessionReplayProperties', () => {
    it('returns empty object when not initialized', () => {
      const result = sessionReplayService.getSessionReplayProperties();
      expect(result).toEqual({});
    });

    it('returns properties from amplitude when initialized', async () => {
      await sessionReplayService.init();

      const result = sessionReplayService.getSessionReplayProperties();
      expect(result).toEqual({
        '[Amplitude]Session Replay ID': 'test-replay-id',
      });
    });

    it('handles errors gracefully', async () => {
      await sessionReplayService.init();

      mockGetSessionReplayProperties.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = sessionReplayService.getSessionReplayProperties();
      expect(result).toEqual({});
    });
  });

  describe('init', () => {
    it('does nothing when already initialized', async () => {
      // First init
      await sessionReplayService.init();
      expect(mockInit).toHaveBeenCalledTimes(1);

      // Second init should be no-op
      await sessionReplayService.init();
      expect(mockInit).toHaveBeenCalledTimes(1);
    });

    it('does nothing when config is disabled', async () => {
      mockGetSessionReplayConfig.mockReturnValue({
        apiKey: 'test-api-key',
        enabled: false,
        sampleRate: 0,
      });

      await sessionReplayService.init();

      // Should not call amplitude init when disabled
      expect(mockInit).not.toHaveBeenCalled();
    });

    it('handles segment not available', async () => {
      mockWaitForSegment.mockResolvedValue(null);

      // Should not throw
      await expect(sessionReplayService.init()).resolves.not.toThrow();
    });

    it('handles initialization errors gracefully', async () => {
      mockInit.mockRejectedValueOnce(new Error('Init failed'));

      // Should not throw
      await expect(sessionReplayService.init()).resolves.not.toThrow();
    });

    it('sets up segment middleware when initialized', async () => {
      await sessionReplayService.init();

      // Should have added source middleware
      expect(mockSegment.addSourceMiddleware).toHaveBeenCalled();
    });
  });

  describe('isInitialized', () => {
    it('returns false before init', () => {
      expect(sessionReplayService.isInitialized()).toBe(false);
    });

    it('returns true after successful init', async () => {
      await sessionReplayService.init();
      expect(sessionReplayService.isInitialized()).toBe(true);
    });
  });

  describe('session ID management', () => {
    it('reads session ID from cookie', async () => {
      document.cookie = 'analytics_session_id=12345; path=/';

      await sessionReplayService.init();

      // Should pass session ID to amplitude init
      expect(mockInit).toHaveBeenCalledWith(
        'test-api-key',
        expect.objectContaining({
          sessionId: 12345,
        })
      );
    });

    it('returns 0 when no session cookie exists', async () => {
      await sessionReplayService.init();

      expect(mockInit).toHaveBeenCalledWith(
        'test-api-key',
        expect.objectContaining({
          sessionId: 0,
        })
      );
    });
  });

  describe('device ID management', () => {
    it('uses segment anonymous ID as device ID', async () => {
      await sessionReplayService.init();

      expect(mockInit).toHaveBeenCalledWith(
        'test-api-key',
        expect.objectContaining({
          deviceId: 'test-anonymous-id',
        })
      );
    });

    it('generates UUID when segment user not available', async () => {
      mockGetSegmentAnalytics.mockReturnValue(null);

      // Mock crypto.randomUUID
      const mockUUID = '12345678-1234-1234-1234-123456789012';
      const originalCrypto = global.crypto;
      Object.defineProperty(global, 'crypto', {
        configurable: true,
        value: {
          ...originalCrypto,
          randomUUID: jest.fn().mockReturnValue(mockUUID),
        },
        writable: true,
      });

      await sessionReplayService.init();

      expect(mockInit).toHaveBeenCalledWith(
        'test-api-key',
        expect.objectContaining({
          deviceId: mockUUID,
        })
      );

      Object.defineProperty(global, 'crypto', {
        configurable: true,
        value: originalCrypto,
        writable: true,
      });
    });
  });

  describe('global sessionReplay object', () => {
    it('sets up window.sessionReplay after init', async () => {
      await sessionReplayService.init();

      expect(window.sessionReplay).toBeDefined();
      expect(typeof window.sessionReplay?.getSessionReplayProperties).toBe('function');
    });

    it('window.sessionReplay.getSessionReplayProperties returns properties', async () => {
      await sessionReplayService.init();

      const props = window.sessionReplay?.getSessionReplayProperties();
      expect(props).toEqual({
        '[Amplitude]Session Replay ID': 'test-replay-id',
      });
    });
  });
});

// Note: Window type augmentation is in src/types/global.d.ts
