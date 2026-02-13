/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import { LaunchDarklyProvider } from './LaunchDarklyProvider';

// Mock LaunchDarkly
jest.mock('launchdarkly-react-client-sdk', () => ({
  LDProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ld-provider">{children}</div>
  ),
}));

// Mock the config function
const mockGetLaunchDarklyConfig = jest.fn().mockReturnValue({
  client: {
    clientSideID: 'test-client-id',
    context: { key: 'test-user', kind: 'user' },
    options: { bootstrap: {}, streaming: true },
    reactOptions: { useCamelCaseFlagKeys: false },
  },
});
jest.mock('./get-launchdarkly-config', () => ({
  getLaunchDarklyConfig: (...args: unknown[]) => mockGetLaunchDarklyConfig(...args),
}));

describe('LaunchDarklyProvider', () => {
  it('renders children inside LDProvider', () => {
    render(
      <LaunchDarklyProvider flagsBootstrap={{}}>
        <div data-testid="child-content">Child Content</div>
      </LaunchDarklyProvider>
    );

    expect(screen.getByTestId('ld-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('accepts userId prop', () => {
    render(
      <LaunchDarklyProvider flagsBootstrap={{ 'test-flag': true }} userId="user-123">
        <div>Test</div>
      </LaunchDarklyProvider>
    );

    expect(mockGetLaunchDarklyConfig).toHaveBeenCalledWith({
      flagsBootstrap: { 'test-flag': true },
      userId: 'user-123',
    });
  });

  it('accepts null userId', () => {
    render(
      <LaunchDarklyProvider flagsBootstrap={{}} userId={null}>
        <div>Test</div>
      </LaunchDarklyProvider>
    );

    expect(mockGetLaunchDarklyConfig).toHaveBeenCalledWith({
      flagsBootstrap: {},
      userId: null,
    });
  });
});
