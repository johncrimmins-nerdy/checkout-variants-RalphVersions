/**
 * Tests for newrelic-browser utilities
 * New Relic configuration and initialization
 */

import { getNewRelicConfig, getNewRelicInitScript, initNewRelicBrowser } from './newrelic-browser';

describe('getNewRelicConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return config when all env vars are set', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';

    const config = getNewRelicConfig();

    expect(config).toEqual({
      accountID: 'account456',
      agentID: 'agent123',
      licenseKey: 'license012',
      trustKey: 'trust789',
    });
  });

  it('should return null when agentID is missing', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';
    delete process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID;

    expect(getNewRelicConfig()).toBeNull();
  });

  it('should return null when accountID is missing', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';
    delete process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID;

    expect(getNewRelicConfig()).toBeNull();
  });

  it('should return null when trustKey is missing', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';
    delete process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY;

    expect(getNewRelicConfig()).toBeNull();
  });

  it('should return null when licenseKey is missing', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    delete process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY;

    expect(getNewRelicConfig()).toBeNull();
  });

  it('should trim whitespace from env vars', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = '  agent123  ';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = '  account456  ';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = '  trust789  ';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = '  license012  ';

    const config = getNewRelicConfig();

    expect(config?.agentID).toBe('agent123');
    expect(config?.accountID).toBe('account456');
  });

  it('should return null for empty strings after trim', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = '   ';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';

    expect(getNewRelicConfig()).toBeNull();
  });
});

describe('getNewRelicInitScript', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return script with config values', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';

    const script = getNewRelicInitScript();

    expect(script).toContain("accountID: 'account456'");
    expect(script).toContain("agentID: 'agent123'");
    expect(script).toContain("trustKey: 'trust789'");
    expect(script).toContain("licenseKey: 'license012'");
    expect(script).toContain("applicationID: 'agent123'");
  });

  it('should include NREUM configuration', () => {
    process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID = 'agent123';
    process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID = 'account456';
    process.env.NEXT_PUBLIC_NEWRELIC_TRUST_KEY = 'trust789';
    process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY = 'license012';

    const script = getNewRelicInitScript();

    expect(script).toContain('window.NREUM');
    expect(script).toContain('NREUM.init');
    expect(script).toContain('NREUM.loader_config');
    expect(script).toContain('NREUM.info');
    expect(script).toContain('distributed_tracing: { enabled: true }');
    expect(script).toContain("beacon: 'bam.nr-data.net'");
  });

  it('should return null when config is missing', () => {
    delete process.env.NEXT_PUBLIC_NEWRELIC_AGENT_ID;
    delete process.env.NEXT_PUBLIC_NEWRELIC_ACCOUNT_ID;

    expect(getNewRelicInitScript()).toBeNull();
  });
});

describe('initNewRelicBrowser', () => {
  const mockAddEventListener = jest.fn();
  const mockSetCustomAttribute = jest.fn();
  const mockAddPageAction = jest.fn();

  beforeEach(() => {
    mockAddEventListener.mockClear();
    mockSetCustomAttribute.mockClear();
    mockAddPageAction.mockClear();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://www.varsitytutors.com/checkout?q=123',
        origin: 'https://www.varsitytutors.com',
        pathname: '/checkout',
        search: '?q=123',
      },
      writable: true,
    });

    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'TestAgent/1.0',
      },
      writable: true,
    });

    window.addEventListener = mockAddEventListener;
  });

  it('should add event listener for newrelic event', () => {
    initNewRelicBrowser();

    expect(mockAddEventListener).toHaveBeenCalledWith('newrelic', expect.any(Function));
  });

  it('should not throw when called', () => {
    expect(() => initNewRelicBrowser()).not.toThrow();
  });

  it('should set custom attributes when newrelic event fires', () => {
    (
      window as { newrelic?: { addPageAction: jest.Mock; setCustomAttribute: jest.Mock } }
    ).newrelic = {
      addPageAction: mockAddPageAction,
      setCustomAttribute: mockSetCustomAttribute,
    };

    initNewRelicBrowser();

    // Get the callback that was registered
    const eventCallback = mockAddEventListener.mock.calls[0][1];

    // Simulate the newrelic event firing
    const mockEvent = {
      detail: { loaded: true },
    } as CustomEvent<{ loaded: boolean }>;

    eventCallback(mockEvent);

    expect(mockSetCustomAttribute).toHaveBeenCalledWith(
      'url',
      'https://www.varsitytutors.com/checkout?q=123'
    );
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('origin', 'https://www.varsitytutors.com');
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('pathname', '/checkout');
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('userAgent', 'TestAgent/1.0');
  });

  it('should track INITIALIZE_AGENT event', () => {
    (
      window as { newrelic?: { addPageAction: jest.Mock; setCustomAttribute: jest.Mock } }
    ).newrelic = {
      addPageAction: mockAddPageAction,
      setCustomAttribute: mockSetCustomAttribute,
    };

    initNewRelicBrowser();

    const eventCallback = mockAddEventListener.mock.calls[0][1];
    const mockEvent = { detail: { loaded: true } } as CustomEvent<{ loaded: boolean }>;
    eventCallback(mockEvent);

    expect(mockAddPageAction).toHaveBeenCalledWith(
      'INITIALIZE_AGENT',
      expect.objectContaining({
        customEventData: expect.objectContaining({
          href: 'https://www.varsitytutors.com/checkout?q=123',
          level: 'INFO',
        }),
      })
    );
  });

  it('should set URL params as custom attributes', () => {
    window.location.search = '?q=quote123&lead_id=lead456';

    (
      window as { newrelic?: { addPageAction: jest.Mock; setCustomAttribute: jest.Mock } }
    ).newrelic = {
      addPageAction: mockAddPageAction,
      setCustomAttribute: mockSetCustomAttribute,
    };

    initNewRelicBrowser();

    const eventCallback = mockAddEventListener.mock.calls[0][1];
    const mockEvent = { detail: { loaded: true } } as CustomEvent<{ loaded: boolean }>;
    eventCallback(mockEvent);

    expect(mockSetCustomAttribute).toHaveBeenCalledWith('q', 'quote123');
    expect(mockSetCustomAttribute).toHaveBeenCalledWith('lead_id', 'lead456');
  });

  afterEach(() => {
    delete (window as { newrelic?: unknown }).newrelic;
  });
});
