/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import WelcomeBackLayout from './WelcomeBackLayout';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

// Mock child components
jest.mock('./AuthenticationModal', () => ({
  __esModule: true,
  default: ({ visible }: { visible: boolean }) =>
    visible ? <div data-testid="auth-modal">Auth Modal</div> : null,
}));

jest.mock('./LoggedInToast', () => ({
  __esModule: true,
  default: ({ visible }: { visible: boolean }) =>
    visible ? <div data-testid="logged-in-toast">Logged In Toast</div> : null,
}));

jest.mock('./WelcomeBackHero', () => ({
  __esModule: true,
  default: ({
    buyerFirstName,
    isLeadResubmission,
  }: {
    buyerFirstName?: string;
    isLeadResubmission?: boolean;
  }) => (
    <div data-testid="welcome-back-hero">
      Hero: {buyerFirstName} {isLeadResubmission ? 'Lead Resubmission' : 'Standard'}
    </div>
  ),
}));

describe('WelcomeBackLayout', () => {
  it('renders children content', () => {
    render(
      <WelcomeBackLayout>
        <div data-testid="child-content">Child Content</div>
      </WelcomeBackLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(
      <WelcomeBackLayout>
        <div>Content</div>
      </WelcomeBackLayout>
    );

    const logo = screen.getByAltText('Varsity Tutors');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('varsity-tutors-logo.svg'));
  });

  it('renders help phone number', () => {
    render(
      <WelcomeBackLayout>
        <div>Content</div>
      </WelcomeBackLayout>
    );

    const phoneLink = screen.getByRole('link', { name: '888-402-6378' });
    expect(phoneLink).toHaveAttribute('href', 'tel:888-402-6378');
  });

  it('renders WelcomeBackHero with buyer name', () => {
    render(
      <WelcomeBackLayout buyerFirstName="John">
        <div>Content</div>
      </WelcomeBackLayout>
    );

    expect(screen.getByTestId('welcome-back-hero')).toHaveTextContent('John');
  });

  it('renders WelcomeBackHero with lead resubmission mode', () => {
    render(
      <WelcomeBackLayout isLeadResubmission={true}>
        <div>Content</div>
      </WelcomeBackLayout>
    );

    expect(screen.getByTestId('welcome-back-hero')).toHaveTextContent('Lead Resubmission');
  });

  describe('AuthenticationModal', () => {
    it('does not show auth modal by default', () => {
      render(
        <WelcomeBackLayout>
          <div>Content</div>
        </WelcomeBackLayout>
      );

      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });

    it('shows auth modal when showAuthModal is true', () => {
      render(
        <WelcomeBackLayout showAuthModal={true}>
          <div>Content</div>
        </WelcomeBackLayout>
      );

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });
  });

  describe('LoggedInToast', () => {
    it('does not show logged in toast by default', () => {
      render(
        <WelcomeBackLayout>
          <div>Content</div>
        </WelcomeBackLayout>
      );

      expect(screen.queryByTestId('logged-in-toast')).not.toBeInTheDocument();
    });

    it('shows logged in toast when showLoggedInToast is true', () => {
      render(
        <WelcomeBackLayout showLoggedInToast={true}>
          <div>Content</div>
        </WelcomeBackLayout>
      );

      expect(screen.getByTestId('logged-in-toast')).toBeInTheDocument();
    });
  });

  it('renders background images', () => {
    const { container } = render(
      <WelcomeBackLayout>
        <div>Content</div>
      </WelcomeBackLayout>
    );

    // Should have background glow images
    // Images with empty alt are presentation role, query by tag
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const images = container.querySelectorAll('img');
    const glowImages = Array.from(images).filter((img) =>
      img.getAttribute('src')?.includes('luminex-glow')
    );
    expect(glowImages.length).toBeGreaterThanOrEqual(1);
  });
});
