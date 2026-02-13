/**
 * @jest-environment jsdom
 */

// Mock server-side dependencies before any imports
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
  }),
}));

jest.mock('../auth/get-user-id', () => ({
  getUserId: jest.fn().mockResolvedValue(null),
}));

jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: jest.fn().mockReturnValue({
    waitForInitialization: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn,
}));

// Import after mocks
import { LaunchDarklyProvider } from './LaunchDarklyProvider';

describe('flags index exports', () => {
  it('exports LaunchDarklyProvider', () => {
    expect(LaunchDarklyProvider).toBeDefined();
  });
});
