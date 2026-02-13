/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('loading state', () => {
    it('shows default loading text when isLoading', () => {
      render(<Button isLoading>Submit</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Loading...');
    });

    it('shows custom loading text when provided', () => {
      render(
        <Button isLoading loadingText="Submitting...">
          Submit
        </Button>
      );

      expect(screen.getByRole('button')).toHaveTextContent('Submitting...');
    });

    it('disables button when isLoading', () => {
      render(<Button isLoading>Submit</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Submit</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Button disabled onClick={onClick}>
          Submit
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Submit</Button>);

      expect(screen.getByRole('button')).toHaveClass('bg-accent-primary');
    });

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Submit</Button>);

      expect(screen.getByRole('button')).toHaveClass('bg-white');
    });

    it('applies outline variant', () => {
      render(<Button variant="outline">Submit</Button>);

      // Light theme outline uses bg-white
      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('applies back variant', () => {
      render(<Button variant="back">Back</Button>);

      expect(screen.getByRole('button')).toHaveClass('flex', 'items-center', 'gap-2');
    });
  });

  describe('theme variants', () => {
    it('applies light theme by default', () => {
      render(<Button>Submit</Button>);

      expect(screen.getByRole('button')).toHaveClass('hover:shadow-btn-light');
    });

    it('applies dark theme classes', () => {
      render(<Button theme="dark">Submit</Button>);

      expect(screen.getByRole('button')).toHaveClass('hover:shadow-btn-dark');
    });

    it('applies dark secondary variant', () => {
      render(
        <Button theme="dark" variant="secondary">
          Submit
        </Button>
      );

      expect(screen.getByRole('button')).toHaveClass('border-white', 'text-white');
    });

    it('applies dark outline variant', () => {
      render(
        <Button theme="dark" variant="outline">
          Submit
        </Button>
      );

      expect(screen.getByRole('button')).toHaveClass('border-white');
    });

    it('applies dark back variant', () => {
      render(
        <Button theme="dark" variant="back">
          Back
        </Button>
      );

      expect(screen.getByRole('button')).toHaveClass('text-blue-400');
    });
  });

  describe('fullWidth', () => {
    it('applies full width by default for non-back variants', () => {
      render(<Button>Submit</Button>);

      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('does not apply full width to back variant', () => {
      render(<Button variant="back">Back</Button>);

      expect(screen.getByRole('button')).not.toHaveClass('w-full');
    });

    it('does not apply full width when fullWidth is false', () => {
      render(<Button fullWidth={false}>Submit</Button>);

      expect(screen.getByRole('button')).not.toHaveClass('w-full');
    });
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Submit</Button>);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('passes through additional button attributes', () => {
    render(
      <Button data-testid="submit-btn" type="submit">
        Submit
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-testid', 'submit-btn');
  });
});
