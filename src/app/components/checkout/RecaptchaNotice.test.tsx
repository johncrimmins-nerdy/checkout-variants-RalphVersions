/**
 * Tests for RecaptchaNotice component
 * reCAPTCHA privacy notice
 */

import { render, screen } from '@testing-library/react';

import RecaptchaNotice from './RecaptchaNotice';

describe('RecaptchaNotice', () => {
  describe('rendering', () => {
    it('should render privacy notice text', () => {
      render(<RecaptchaNotice />);

      expect(screen.getByText(/This site is protected by reCAPTCHA/)).toBeInTheDocument();
      expect(screen.getByText(/and the Google/)).toBeInTheDocument();
    });

    it('should render Privacy Policy link', () => {
      render(<RecaptchaNotice />);

      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', 'https://policies.google.com/privacy');
      expect(privacyLink).toHaveAttribute('target', '_blank');
      expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Terms of Service link', () => {
      render(<RecaptchaNotice />);

      const termsLink = screen.getByRole('link', { name: /Terms of Service/i });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', 'https://policies.google.com/terms');
      expect(termsLink).toHaveAttribute('target', '_blank');
      expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('variants', () => {
    it('should apply light theme styles by default', () => {
      const { container } = render(<RecaptchaNotice />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const notice = container.querySelector('p');
      expect(notice?.className).toContain('text-gray-500');
    });

    it('should apply dark theme styles when variant is dark', () => {
      const { container } = render(<RecaptchaNotice variant="dark" />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const notice = container.querySelector('p');
      expect(notice?.className).toContain('text-white/40');
    });

    it('should have gray links in light theme', () => {
      render(<RecaptchaNotice />);

      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
      expect(privacyLink.className).toContain('text-gray-600');
    });

    it('should have muted white links in dark theme', () => {
      render(<RecaptchaNotice variant="dark" />);

      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
      expect(privacyLink.className).toContain('text-white/50');
    });
  });

  describe('styling', () => {
    it('should have small text size', () => {
      const { container } = render(<RecaptchaNotice />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const notice = container.querySelector('p');
      expect(notice?.className).toContain('text-xs');
    });

    it('should have underlined links', () => {
      render(<RecaptchaNotice />);

      const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
      expect(privacyLink.className).toContain('underline');

      const termsLink = screen.getByRole('link', { name: /Terms of Service/i });
      expect(termsLink.className).toContain('underline');
    });

    it('should have max width constraint', () => {
      const { container } = render(<RecaptchaNotice />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const notice = container.querySelector('p');
      expect(notice?.className).toContain('max-w-[400px]');
    });
  });
});
