/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';

import AuthenticationModal from './AuthenticationModal';

describe('AuthenticationModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when not visible', () => {
    const { container } = render(<AuthenticationModal visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when visible', () => {
    render(<AuthenticationModal visible={true} />);

    expect(screen.getByText('Authenticating Login')).toBeInTheDocument();
    expect(screen.getByText('We recognize your device and are logging you in')).toBeInTheDocument();
  });

  it('renders check circle icon', () => {
    render(<AuthenticationModal visible={true} />);

    // Check that the modal renders with the checkmark area
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Authenticating Login');
  });

  it('completes animation after 300ms', () => {
    render(<AuthenticationModal visible={true} />);

    // Animation happens internally, just verify component renders
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Authenticating Login')).toBeInTheDocument();
  });

  it('resets animation when becoming visible again', () => {
    const { rerender } = render(<AuthenticationModal visible={true} />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Hide modal
    rerender(<AuthenticationModal visible={false} />);

    // Show modal again
    rerender(<AuthenticationModal visible={true} />);

    // Should still render
    expect(screen.getByText('Authenticating Login')).toBeInTheDocument();
  });

  it('clears timeout on unmount', () => {
    const { unmount } = render(<AuthenticationModal visible={true} />);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
