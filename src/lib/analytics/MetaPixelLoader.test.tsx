/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';

import { MetaPixelLoader } from './MetaPixelLoader';

describe('MetaPixelLoader', () => {
  const mockPixelId = '123456789';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Reset window.fbq
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).fbq;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)._fbq;

    // Reset cookies
    document.cookie = '_fbc=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    // Reset DOM
    document.head.innerHTML = '';

    // Mock window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        hostname: 'www.varsitytutors.com',
        protocol: 'https:',
        search: '',
      },
      writable: true,
    });

    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('component rendering', () => {
    it('renders null (no visible output)', () => {
      // Act
      const { container } = render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert
      expect(container.firstChild).toBeNull();
    });
  });

  describe('pixel stub setup', () => {
    it('sets up window.fbq stub on mount', () => {
      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).fbq).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (window as any).fbq).toBe('function');
    });

    it('calls fbq init with pixelId', () => {
      // Arrange
      const queuedCalls: unknown[][] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq = Object.assign(
        (...args: unknown[]) => {
          queuedCalls.push(args);
        },
        { loaded: true, queue: queuedCalls }
      );

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert
      expect(queuedCalls).toContainEqual(['init', mockPixelId]);
    });

    it('calls fbq track PageView', () => {
      // Arrange
      const queuedCalls: unknown[][] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq = Object.assign(
        (...args: unknown[]) => {
          queuedCalls.push(args);
        },
        { loaded: true, queue: queuedCalls }
      );

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert
      expect(queuedCalls).toContainEqual(['track', 'PageView']);
    });

    it('does not overwrite existing fbq', () => {
      // Arrange
      const existingFbq = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq = existingFbq;

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).fbq).toBe(existingFbq);
    });
  });

  describe('fbclid capture', () => {
    it('captures fbclid from URL and sets _fbc cookie', () => {
      // Arrange
      // Use localhost to avoid JSDOM domain cookie restrictions
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          search: '?fbclid=test-fbclid-123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - verify cookie setter was called with correct format
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc=fb.1.'));
      expect(fbcCookieCall).toBeDefined();
      expect(fbcCookieCall?.[0]).toContain('test-fbclid-123');
    });

    it('does not set _fbc cookie when fbclid is not in URL', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          search: '?utm_source=google',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - _fbc cookie should not be set
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall).toBeUndefined();
    });
  });

  describe('_fbp cookie generation', () => {
    it('generates _fbp cookie when not present', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          search: '',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - verify _fbp cookie setter was called
      const fbpCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbp=fb.1.'));
      expect(fbpCookieCall).toBeDefined();
    });

    it('does not overwrite existing _fbp cookie', () => {
      // Arrange
      document.cookie = '_fbp=existing-fbp-value; path=/';
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - _fbp cookie should not be set again
      const fbpCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbp=fb.1.'));
      expect(fbpCookieCall).toBeUndefined();
    });
  });

  describe('script loading', () => {
    it('loads Meta Pixel script after delay', () => {
      // Act
      render(<MetaPixelLoader loadDelay={2000} pixelId={mockPixelId} />);

      // Assert - script should not be loaded yet
      expect(document.head.innerHTML).not.toContain('fbevents.js');

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Assert - script should now be loaded
      expect(document.head.innerHTML).toContain('fbevents.js');
      expect(document.head.innerHTML).toContain('https://connect.facebook.net/en_US/fbevents.js');
    });

    it('uses custom loadDelay', () => {
      // Arrange
      const customDelay = 5000;

      // Act
      render(<MetaPixelLoader loadDelay={customDelay} pixelId={mockPixelId} />);

      // Assert - script should not be loaded after default delay
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(document.head.innerHTML).not.toContain('fbevents.js');

      // Assert - script should be loaded after custom delay
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(document.head.innerHTML).toContain('fbevents.js');
    });

    it('does not load script if already exists', () => {
      // Arrange
      const existingScript = document.createElement('script');
      existingScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(existingScript);
      const consoleSpy = jest.spyOn(console, 'log');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Assert - should log that script already exists
      expect(consoleSpy).toHaveBeenCalledWith('[Meta Pixel] Script already exists, skipping');
      // Only one script should exist (check innerHTML for single occurrence)
      const matches = document.head.innerHTML.match(/fbevents\.js/g);
      expect(matches?.length).toBe(1);
    });

    it('clears timeout on unmount', () => {
      // Arrange
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Act
      const { unmount } = render(<MetaPixelLoader pixelId={mockPixelId} />);
      unmount();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('root domain extraction', () => {
    it('includes domain attribute for multi-level domains', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'www.varsitytutors.com',
          protocol: 'https:',
          search: '?fbclid=test123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - cookie should have domain attribute
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall?.[0]).toContain('domain=.varsitytutors.com');
    });

    it('omits domain attribute for localhost', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          search: '?fbclid=test123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - cookie should NOT have domain attribute
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall?.[0]).not.toContain('domain=');
    });

    it('omits domain attribute for IP addresses', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: '127.0.0.1',
          protocol: 'http:',
          search: '?fbclid=test123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - cookie should NOT have domain attribute
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall?.[0]).not.toContain('domain=');
    });
  });

  describe('cookie security', () => {
    it('includes Secure flag when protocol is https', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'www.varsitytutors.com',
          protocol: 'https:',
          search: '?fbclid=test123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - cookie should include Secure flag
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall?.[0]).toContain('; Secure');
    });

    it('omits Secure flag when protocol is http', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          hostname: 'localhost',
          protocol: 'http:',
          search: '?fbclid=test123',
        },
        writable: true,
      });
      const cookieSpy = jest.spyOn(document, 'cookie', 'set');

      // Act
      render(<MetaPixelLoader pixelId={mockPixelId} />);

      // Assert - cookie should NOT include Secure flag
      const fbcCookieCall = cookieSpy.mock.calls.find((call) => call[0].startsWith('_fbc='));
      expect(fbcCookieCall?.[0]).not.toContain('; Secure');
    });
  });

  describe('error handling', () => {
    it('logs error when fbclid capture fails', () => {
      // Arrange
      const errorSpy = jest.spyOn(console, 'error');
      // Mock URLSearchParams to throw an error
      const originalURLSearchParams = global.URLSearchParams;
      global.URLSearchParams = jest.fn().mockImplementation(() => {
        throw new Error('URLSearchParams error');
      }) as unknown as typeof URLSearchParams;

      // Act - should not throw
      expect(() => {
        render(<MetaPixelLoader pixelId={mockPixelId} />);
      }).not.toThrow();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        '[Meta Pixel] Error capturing fbclid:',
        expect.any(Error)
      );

      // Cleanup
      global.URLSearchParams = originalURLSearchParams;
    });
  });
});
