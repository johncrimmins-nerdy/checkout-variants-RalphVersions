/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import TermsOfCustomerAccountUsePage from './page';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => `/checkout${path}`,
}));

jest.mock('@/lib/content/terms-of-customer-account-use', () => '<p>Terms Content</p>');

describe('TermsOfCustomerAccountUsePage', () => {
  it('renders the page with navbar', () => {
    render(<TermsOfCustomerAccountUsePage />);

    // Check for logo link
    const logoLink = screen.getByRole('link', { name: /varsity tutors/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', 'https://www.varsitytutors.com');
  });

  it('renders terms content', () => {
    render(<TermsOfCustomerAccountUsePage />);

    // The page renders HTML content from the terms module
    expect(screen.getByText(/Terms Content/i)).toBeInTheDocument();
  });

  it('has page wrapper structure', () => {
    const { container } = render(<TermsOfCustomerAccountUsePage />);

    expect(container.innerHTML).toContain('page-wrapper');
    expect(container.innerHTML).toContain('nav-wrapper');
  });
});
