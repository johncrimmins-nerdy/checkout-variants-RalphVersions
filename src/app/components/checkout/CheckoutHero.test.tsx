/**
 * Tests for CheckoutHero component
 * Main hero section of the checkout page
 */

import { render, screen } from '@testing-library/react';

import CheckoutHero from './CheckoutHero';

describe('CheckoutHero', () => {
  describe('rendering', () => {
    it('should render completion prompt', () => {
      render(<CheckoutHero />);

      expect(screen.getByText('Complete your purchase')).toBeInTheDocument();
    });

    it('should render main headline', () => {
      render(<CheckoutHero />);

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Your personalized learning experience is just one step away/i,
        })
      ).toBeInTheDocument();
    });

    it('should render Trustpilot reviews section', () => {
      render(<CheckoutHero />);

      expect(screen.getByText(/11,095 Trustpilot Reviews/)).toBeInTheDocument();
    });

    it('should render star rating image', () => {
      render(<CheckoutHero />);

      const starsImage = screen.getByAltText('4.5 of 5 stars');
      expect(starsImage).toBeInTheDocument();
    });
  });

  describe('image attributes', () => {
    it('should have correct star image dimensions', () => {
      render(<CheckoutHero />);

      const starsImage = screen.getByAltText('4.5 of 5 stars');
      expect(starsImage).toHaveAttribute('width', '87');
      expect(starsImage).toHaveAttribute('height', '16');
    });
  });

  describe('semantic structure', () => {
    it('should use h1 for main heading', () => {
      render(<CheckoutHero />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should use p for subtitle', () => {
      render(<CheckoutHero />);

      // The "Complete your purchase" text should be in a paragraph
      const subtitle = screen.getByText('Complete your purchase');
      expect(subtitle.tagName).toBe('P');
    });
  });
});
