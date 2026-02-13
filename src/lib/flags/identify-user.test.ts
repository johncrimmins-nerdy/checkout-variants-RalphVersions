import type { LDClient } from 'launchdarkly-react-client-sdk';

import { identifyUserToLaunchDarkly } from './identify-user';

describe('identifyUserToLaunchDarkly', () => {
  const mockIdentify = jest.fn();
  const mockLDClient: Partial<LDClient> = {
    identify: mockIdentify,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('identifies user with correct context', async () => {
    mockIdentify.mockResolvedValue(undefined);

    await identifyUserToLaunchDarkly(mockLDClient as LDClient, 'user-123');

    expect(mockIdentify).toHaveBeenCalledWith({
      key: 'user-123',
      kind: 'user',
    });
  });

  it('does nothing when ldClient is undefined', async () => {
    await identifyUserToLaunchDarkly(undefined, 'user-123');

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('does nothing when userUID is undefined', async () => {
    await identifyUserToLaunchDarkly(mockLDClient as LDClient, undefined);

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('does nothing when both params are undefined', async () => {
    await identifyUserToLaunchDarkly(undefined, undefined);

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('handles identify error gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockIdentify.mockRejectedValue(new Error('Identify failed'));

    await expect(
      identifyUserToLaunchDarkly(mockLDClient as LDClient, 'user-123')
    ).resolves.not.toThrow();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[LaunchDarkly] Failed to identify user:',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('logs success message on successful identification', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    mockIdentify.mockResolvedValue(undefined);

    await identifyUserToLaunchDarkly(mockLDClient as LDClient, 'user-456');

    expect(consoleDebugSpy).toHaveBeenCalledWith('[LaunchDarkly] User identified:', 'user-456');

    consoleDebugSpy.mockRestore();
  });
});
