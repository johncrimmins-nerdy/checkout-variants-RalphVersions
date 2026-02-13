/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import { NewRelicRouteTracker } from './NewRelicRouteTracker';

// Mock usePathname from next/navigation
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('NewRelicRouteTracker', () => {
  const mockSetPageViewName = jest.fn();
  const mockSetCurrentRouteName = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');

    // Set up window.newrelic mock
    Object.defineProperty(window, 'newrelic', {
      configurable: true,
      value: {
        setCurrentRouteName: mockSetCurrentRouteName,
        setPageViewName: mockSetPageViewName,
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up window.newrelic
    window.newrelic = undefined;
  });

  it('renders null (no visible output)', () => {
    const { container } = render(<NewRelicRouteTracker />);
    expect(container.firstChild).toBeNull();
  });

  it('sets page view name on initial mount', () => {
    mockPathname.mockReturnValue('/');
    render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-home');
    expect(mockSetCurrentRouteName).not.toHaveBeenCalled();
  });

  it('formats root path as checkout-home', () => {
    mockPathname.mockReturnValue('/');
    render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-home');
  });

  it('formats path with prefix checkout-', () => {
    mockPathname.mockReturnValue('/welcome-back');
    render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-welcome-back');
  });

  it('formats nested paths correctly', () => {
    mockPathname.mockReturnValue('/account-creation');
    render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-account-creation');
  });

  it('sets current route name on path change', () => {
    mockPathname.mockReturnValue('/');
    const { rerender } = render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-home');
    expect(mockSetCurrentRouteName).not.toHaveBeenCalled();

    // Simulate route change
    mockPathname.mockReturnValue('/welcome-back');
    rerender(<NewRelicRouteTracker />);

    expect(mockSetCurrentRouteName).toHaveBeenCalledWith('checkout-welcome-back');
  });

  it('does not call setCurrentRouteName when path has not changed', () => {
    mockPathname.mockReturnValue('/welcome-back');
    const { rerender } = render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentRouteName).not.toHaveBeenCalled();

    // Re-render with same path
    rerender(<NewRelicRouteTracker />);

    expect(mockSetCurrentRouteName).not.toHaveBeenCalled();
  });

  it('handles missing window.newrelic gracefully', () => {
    window.newrelic = undefined;

    mockPathname.mockReturnValue('/');

    // Should not throw
    expect(() => render(<NewRelicRouteTracker />)).not.toThrow();
  });

  it('handles multiple route changes', () => {
    mockPathname.mockReturnValue('/');
    const { rerender } = render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-home');

    // First route change
    mockPathname.mockReturnValue('/quotepage');
    rerender(<NewRelicRouteTracker />);
    expect(mockSetCurrentRouteName).toHaveBeenCalledWith('checkout-quotepage');

    // Second route change
    mockPathname.mockReturnValue('/success');
    rerender(<NewRelicRouteTracker />);
    expect(mockSetCurrentRouteName).toHaveBeenCalledWith('checkout-success');

    expect(mockSetCurrentRouteName).toHaveBeenCalledTimes(2);
  });

  it('strips base path from pathname', () => {
    // When pathname includes base path, it should be stripped
    mockPathname.mockReturnValue('/checkout/welcome-back');

    // Mock env var
    const originalEnv = process.env.NEXT_PUBLIC_BASE_PATH;
    process.env.NEXT_PUBLIC_BASE_PATH = '/checkout';

    render(<NewRelicRouteTracker />);

    expect(mockSetPageViewName).toHaveBeenCalledWith('checkout-welcome-back');

    process.env.NEXT_PUBLIC_BASE_PATH = originalEnv;
  });
});
