import { getLaunchDarklyConfig } from './get-launchdarkly-config';

describe('getLaunchDarklyConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      LAUNCHDARKLY_SERVER_TOKEN: 'server-token',
      NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID: 'client-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('client configuration', () => {
    it('uses client ID from environment', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.client.clientSideID).toBe('client-id');
    });

    it('includes flags bootstrap', () => {
      const bootstrap = { 'feature-flag': true };
      const config = getLaunchDarklyConfig({ flagsBootstrap: bootstrap });

      expect(config.client.options.bootstrap).toEqual(bootstrap);
    });

    it('enables streaming by default', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.client.options.streaming).toBe(true);
    });

    it('disables camelCase flag keys', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.client.reactOptions.useCamelCaseFlagKeys).toBe(false);
    });
  });

  describe('server configuration', () => {
    it('uses server token from environment', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.server.key).toBe('server-token');
    });

    it('disables streaming for server', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.server.options.stream).toBe(false);
    });

    it('runs in online mode when server token is configured', () => {
      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.server.options.offline).toBe(false);
    });

    it('runs in offline mode when server token is missing', () => {
      delete process.env.LAUNCHDARKLY_SERVER_TOKEN;

      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.server.options.offline).toBe(true);
    });
  });

  describe('user context', () => {
    it('creates authenticated context when userId is provided', () => {
      const config = getLaunchDarklyConfig({
        flagsBootstrap: {},
        userId: 'user-123',
      });

      expect(config.client.context).toEqual({
        key: 'user-123',
        kind: 'user',
      });
      expect(config.client.context.anonymous).toBeUndefined();
    });

    it('creates anonymous context when userId is null', () => {
      const config = getLaunchDarklyConfig({
        flagsBootstrap: {},
        userId: null,
      });

      expect(config.client.context).toEqual({
        anonymous: true,
        key: 'anonymous-user',
        kind: 'user',
      });
    });

    it('creates anonymous context when userId is undefined', () => {
      const config = getLaunchDarklyConfig({
        flagsBootstrap: {},
      });

      expect(config.client.context).toEqual({
        anonymous: true,
        key: 'anonymous-user',
        kind: 'user',
      });
    });

    it('uses same context for client and server', () => {
      const config = getLaunchDarklyConfig({
        flagsBootstrap: {},
        userId: 'user-456',
      });

      expect(config.client.context).toEqual(config.server.context);
    });
  });

  describe('missing environment variables', () => {
    it('returns empty string for missing client ID', () => {
      delete process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID;

      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.client.clientSideID).toBe('');
    });

    it('returns empty string for missing server token', () => {
      delete process.env.LAUNCHDARKLY_SERVER_TOKEN;

      const config = getLaunchDarklyConfig({ flagsBootstrap: {} });

      expect(config.server.key).toBe('');
    });
  });
});
