/**
 * Tests for TermsCheckbox component
 * User agreement checkbox for checkout
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TermsCheckbox from './TermsCheckbox';

describe('TermsCheckbox', () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render checkbox with label', () => {
      render(<TermsCheckbox {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/I agree to the/)).toBeInTheDocument();
    });

    it('should render Terms of Customer Account Use link', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const termsLink = screen.getByRole('link', { name: /Terms of Customer Account Use/i });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('target', '_blank');
      expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Electronic Communication Policy link', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const policyLink = screen.getByRole('link', { name: /Electronic Communication Policy/i });
      expect(policyLink).toBeInTheDocument();
      expect(policyLink).toHaveAttribute('target', '_blank');
      expect(policyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show unchecked state by default', () => {
      render(<TermsCheckbox {...defaultProps} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should show checked state when checked prop is true', () => {
      render(<TermsCheckbox {...defaultProps} checked />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('interaction', () => {
    it('should call onChange with true when checked', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<TermsCheckbox {...defaultProps} onChange={mockOnChange} />);

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with false when unchecked', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<TermsCheckbox {...defaultProps} checked onChange={mockOnChange} />);

      await user.click(screen.getByRole('checkbox'));

      expect(mockOnChange).toHaveBeenCalledWith(false);
    });

    it('should be clickable via label', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<TermsCheckbox {...defaultProps} onChange={mockOnChange} />);

      // Click on the label text (not the checkbox directly)
      await user.click(screen.getByText(/I agree to the/));

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe('variants', () => {
    it('should apply light theme styles by default', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const text = screen.getByText(/I agree to the/);
      expect(text.className).toContain('text-gray-700');
    });

    it('should apply dark theme styles when variant is dark', () => {
      render(<TermsCheckbox {...defaultProps} variant="dark" />);

      const text = screen.getByText(/I agree to the/);
      expect(text.className).toContain('text-white/80');
    });

    it('should have blue links in light theme', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const termsLink = screen.getByRole('link', { name: /Terms of Customer Account Use/i });
      expect(termsLink.className).toContain('text-blue-600');
    });

    it('has cyan links in dark theme', () => {
      render(<TermsCheckbox {...defaultProps} variant="dark" />);

      const termsLink = screen.getByRole('link', { name: /Terms of Customer Account Use/i });
      expect(termsLink.className).toContain('text-accent-cyan');
    });
  });

  describe('accessibility', () => {
    it('should have proper checkbox name attribute', () => {
      render(<TermsCheckbox {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'Agree-To-Terms-Checkbox');
    });

    it('should have tracking data attributes', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-element_id', 'terms_of_use');
      expect(checkbox).toHaveAttribute('data-element_type', 'input');
      expect(checkbox).toHaveAttribute('data-input_type', 'checkbox');
      expect(checkbox).toHaveAttribute('data-page_section', 'express_checkout');
    });

    it('should have tracking data on links', () => {
      render(<TermsCheckbox {...defaultProps} />);

      const termsLink = screen.getByRole('link', { name: /Terms of Customer Account Use/i });
      expect(termsLink).toHaveAttribute('data-element_id', 'terms_of_use_link');
      expect(termsLink).toHaveAttribute('data-element_type', 'link');

      const policyLink = screen.getByRole('link', { name: /Electronic Communication Policy/i });
      expect(policyLink).toHaveAttribute('data-element_id', 'electronic_policy_link');
      expect(policyLink).toHaveAttribute('data-element_type', 'link');
    });
  });
});
