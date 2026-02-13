/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import WelcomeBackHero from './WelcomeBackHero';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

describe('WelcomeBackHero', () => {
  describe('greeting', () => {
    it('renders generic welcome back when no name provided', () => {
      render(<WelcomeBackHero />);

      // When no name provided, renders "Welcome Back !" (with space before exclamation)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Welcome Back/);
    });

    it('renders personalized welcome with buyer name', () => {
      render(<WelcomeBackHero buyerFirstName="John" />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome Back, John!');
    });

    it('renders lead resubmission greeting', () => {
      render(<WelcomeBackHero buyerFirstName="Sarah" isLeadResubmission={true} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /You're one step away from a breakthrough moment, Sarah!/
      );
      expect(
        screen.getByText('Continue your progress with the tutor you already know and trust.')
      ).toBeInTheDocument();
    });

    it('renders lead resubmission with fallback name', () => {
      render(<WelcomeBackHero isLeadResubmission={true} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /You're one step away from a breakthrough moment, there!/
      );
    });
  });

  describe('personalized message', () => {
    it('renders personalized message when provided', () => {
      render(
        <WelcomeBackHero
          buyerFirstName="Test"
          personalizedMessage={{
            body: 'This is your personalized message.',
            header: 'Special Offer',
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Special Offer');
      expect(screen.getByText('This is your personalized message.')).toBeInTheDocument();
    });

    it('does not render personalized message when not provided', () => {
      render(<WelcomeBackHero buyerFirstName="Test" />);

      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });
  });

  describe('Live+AI Advantage section', () => {
    it('renders the Live+AI branding', () => {
      render(<WelcomeBackHero />);

      expect(screen.getByText('Live+AI')).toBeInTheDocument();
      expect(screen.getByText('Advantage')).toBeInTheDocument();
      expect(screen.getByText('TM')).toBeInTheDocument();
    });

    it('renders all feature items', () => {
      render(<WelcomeBackHero />);

      expect(screen.getByText(/Live 1-to-1 private tutoring/)).toBeInTheDocument();
      expect(screen.getByText(/Live weekly prep classes/)).toBeInTheDocument();
      expect(screen.getByText(/Instant video playback/)).toBeInTheDocument();
      expect(screen.getByText(/AI session summaries/)).toBeInTheDocument();
      expect(screen.getByText(/Adaptive diagnostics & practice problems/)).toBeInTheDocument();
      expect(screen.getByText(/AI Tutor —/)).toBeInTheDocument();
    });

    it('renders NEW badges for new features', () => {
      render(<WelcomeBackHero />);

      // There should be 3 NEW badges
      const newBadges = screen.getAllByText('NEW');
      expect(newBadges).toHaveLength(3);
    });

    it('renders check icons for non-new features', () => {
      const { container } = render(<WelcomeBackHero />);

      // Check icons are rendered via next/image mock
      // Images with empty alt are presentation role, query by tag
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const allImages = container.querySelectorAll('img');
      // Should have at least 3 check icons
      expect(allImages.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('trust statement', () => {
    it('renders the trust statement', () => {
      render(<WelcomeBackHero />);

      expect(
        screen.getByText(/The largest live tutoring platform in the U.S./i)
      ).toBeInTheDocument();
      expect(screen.getByText(/serving 1,000\+ schools/i)).toBeInTheDocument();
    });
  });
});
