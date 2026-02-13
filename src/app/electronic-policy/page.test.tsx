/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import ElectronicPolicyPage from './page';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

jest.mock('@/lib/utils/asset-url', () => ({
  assetUrl: (path: string) => `/checkout${path}`,
}));

jest.mock('@/lib/content/electronic-policy', () => '<p>Electronic Policy Content</p>');

describe('ElectronicPolicyPage', () => {
  it('renders the page with navbar', () => {
    render(<ElectronicPolicyPage />);

    // Check for logo link
    const logoLink = screen.getByRole('link', { name: /varsity tutors/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', 'https://www.varsitytutors.com');
  });

  it('renders policy content', () => {
    render(<ElectronicPolicyPage />);

    // The page renders HTML content from the electronic-policy module
    expect(screen.getByText(/Electronic Policy Content/i)).toBeInTheDocument();
  });

  it('has page wrapper structure', () => {
    const { container } = render(<ElectronicPolicyPage />);

    expect(container.innerHTML).toContain('page-wrapper');
    expect(container.innerHTML).toContain('nav-wrapper');
  });
});
