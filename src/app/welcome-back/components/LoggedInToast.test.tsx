/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';

import LoggedInToast from './LoggedInToast';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

describe('LoggedInToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the toast message', () => {
    render(<LoggedInToast visible={true} />);

    expect(screen.getByText("You're logged in.")).toBeInTheDocument();
  });

  it('renders the check circle icon', () => {
    const { container } = render(<LoggedInToast visible={true} />);

    // Images with empty alt are presentation role, query by tag
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const icon = container.querySelector('img');
    expect(icon).toHaveAttribute('src', expect.stringContaining('CheckCircle.svg'));
  });

  it('applies visible styles when visible is true', () => {
    const { container } = render(<LoggedInToast visible={true} />);

    const toastContainer = container.firstChild as HTMLElement;
    expect(toastContainer.className).toContain('translate-y-0');
    expect(toastContainer.className).toContain('opacity-100');
  });

  it('applies hidden styles when visible is false', () => {
    const { container } = render(<LoggedInToast visible={false} />);

    const toastContainer = container.firstChild as HTMLElement;
    expect(toastContainer.className).toContain('-translate-y-full');
    expect(toastContainer.className).toContain('opacity-0');
  });

  it('calls onHide after 5 seconds when visible', () => {
    const onHide = jest.fn();
    render(<LoggedInToast onHide={onHide} visible={true} />);

    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('does not call onHide when not visible', () => {
    const onHide = jest.fn();
    render(<LoggedInToast onHide={onHide} visible={false} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  it('clears timeout on unmount', () => {
    const onHide = jest.fn();
    const { unmount } = render(<LoggedInToast onHide={onHide} visible={true} />);

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  it('resets timeout when visibility changes', () => {
    const onHide = jest.fn();
    const { rerender } = render(<LoggedInToast onHide={onHide} visible={false} />);

    // Make visible
    rerender(<LoggedInToast onHide={onHide} visible={true} />);

    act(() => {
      jest.advanceTimersByTime(2500); // Half the time
    });

    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2500); // Complete the time
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });
});
