/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from './Input';

// Helper to get input element (component uses floating label pattern without proper htmlFor)
const getInput = (container: HTMLElement) =>
  // eslint-disable-next-line testing-library/no-node-access
  container.querySelector('input') as HTMLInputElement;

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    const { container } = render(<Input label="Email" />);

    const input = getInput(container);
    await user.type(input, 'test@example.com');

    expect(input).toHaveValue('test@example.com');
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      const { container } = render(<Input label="Email" />);

      const input = getInput(container);
      expect(input).toHaveClass('bg-white', 'border-gray-300');
    });

    it('applies dark theme classes', () => {
      const { container } = render(<Input label="Email" theme="dark" />);

      const input = getInput(container);
      expect(input).toHaveClass('text-white');
    });

    it('applies dark theme wrapper class', () => {
      const { container } = render(<Input label="Email" theme="dark" />);

      expect(container.firstChild).toHaveClass('luminex-wrapper');
    });
  });

  describe('error state', () => {
    it('applies error border class when error is true', () => {
      const { container } = render(<Input error label="Email" />);

      const input = getInput(container);
      expect(input).toHaveClass('border-red-500');
    });

    it('does not apply error class when error is false', () => {
      const { container } = render(<Input error={false} label="Email" />);

      const input = getInput(container);
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  it('passes through additional input attributes', () => {
    const { container } = render(
      <Input autoComplete="email" label="Email" name="email" required type="email" />
    );

    const input = getInput(container);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toBeRequired();
  });

  it('has tracking classes for analytics', () => {
    const { container } = render(<Input label="Email" />);

    const input = getInput(container);
    expect(input).toHaveClass('track-input', 'track-input-focusin', 'track-input-focusout');
  });

  it('uses space as placeholder for floating label behavior', () => {
    const { container } = render(<Input label="Email" />);

    const input = getInput(container);
    expect(input).toHaveAttribute('placeholder', ' ');
  });
});
