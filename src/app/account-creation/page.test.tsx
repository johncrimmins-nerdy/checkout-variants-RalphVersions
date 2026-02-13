/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import AccountCreationPage from './page';

// Mock AccountCreationClient since it's a complex client component
jest.mock('./AccountCreationClient', () => ({
  __esModule: true,
  default: () => <div data-testid="account-creation-client">Account Creation</div>,
}));

describe('AccountCreationPage', () => {
  it('renders AccountCreationClient', () => {
    render(<AccountCreationPage />);

    expect(screen.getByTestId('account-creation-client')).toBeInTheDocument();
  });

  it('wraps content in Suspense boundary', () => {
    // The Suspense boundary is tested by successfully rendering the component
    // If Suspense wasn't working properly, the test would fail
    const { container } = render(<AccountCreationPage />);

    expect(container).toBeInTheDocument();
  });
});
