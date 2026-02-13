/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';

import CheckoutCompletedModal from './CheckoutCompletedModal';

// Track redirects via a mock
const locationAssignSpy = jest.fn();

// Setup location mock using Object.defineProperty on window
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...window.location,
      assign: locationAssignSpy,
      href: '',
    },
    writable: true,
  });
  // Also track href assignments
  Object.defineProperty(window.location, 'href', {
    set: locationAssignSpy,
  });
});

describe('CheckoutCompletedModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    locationAssignSpy.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when not visible', () => {
    const { container } = render(<CheckoutCompletedModal visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when visible', () => {
    render(<CheckoutCompletedModal visible={true} />);

    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(
      screen.getByText('Your learning plan is now active. Next up—requesting your new tutor.')
    ).toBeInTheDocument();
  });

  it('renders check circle icon area', () => {
    render(<CheckoutCompletedModal visible={true} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Welcome back!');
  });

  it('completes animation after 300ms', () => {
    render(<CheckoutCompletedModal visible={true} />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  });

  it('redirects after 3 seconds when redirectUrl is provided', () => {
    render(<CheckoutCompletedModal redirectUrl="https://example.com/success" visible={true} />);

    expect(locationAssignSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(locationAssignSpy).toHaveBeenCalledWith('https://example.com/success');
  });

  it('does not redirect when redirectUrl is null', () => {
    render(<CheckoutCompletedModal redirectUrl={null} visible={true} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(locationAssignSpy).not.toHaveBeenCalled();
  });

  it('does not redirect when redirectUrl is not provided', () => {
    render(<CheckoutCompletedModal visible={true} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(locationAssignSpy).not.toHaveBeenCalled();
  });

  it('only redirects once', () => {
    render(<CheckoutCompletedModal redirectUrl="https://example.com/success" visible={true} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(locationAssignSpy).toHaveBeenCalledTimes(1);
    expect(locationAssignSpy).toHaveBeenCalledWith('https://example.com/success');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should not have been called again
    expect(locationAssignSpy).toHaveBeenCalledTimes(1);
  });

  it('uses latest redirectUrl value', () => {
    const { rerender } = render(
      <CheckoutCompletedModal redirectUrl="https://example.com/first" visible={true} />
    );

    // Change redirectUrl
    rerender(<CheckoutCompletedModal redirectUrl="https://example.com/second" visible={true} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(locationAssignSpy).toHaveBeenCalledWith('https://example.com/second');
  });

  it('clears timeout on unmount', () => {
    const { unmount } = render(
      <CheckoutCompletedModal redirectUrl="https://example.com/success" visible={true} />
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should not have redirected
    expect(locationAssignSpy).not.toHaveBeenCalled();
  });
});
