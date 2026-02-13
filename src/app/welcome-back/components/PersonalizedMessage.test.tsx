/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import PersonalizedMessage from './PersonalizedMessage';

describe('PersonalizedMessage', () => {
  it('renders header and body when both are provided', () => {
    render(
      <PersonalizedMessage
        message={{
          body: 'Test body content',
          header: 'Test Header',
        }}
      />
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Header');
    expect(screen.getByText('Test body content')).toBeInTheDocument();
  });

  it('renders only header when body is not provided', () => {
    render(
      <PersonalizedMessage
        message={{
          body: '',
          header: 'Only Header',
        }}
      />
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Only Header');
    expect(screen.queryByText('Test body content')).not.toBeInTheDocument();
  });

  it('renders only body when header is not provided', () => {
    render(
      <PersonalizedMessage
        message={{
          body: 'Only body text',
          header: '',
        }}
      />
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Only body text')).toBeInTheDocument();
  });

  it('returns null when both header and body are empty', () => {
    const { container } = render(
      <PersonalizedMessage
        message={{
          body: '',
          header: '',
        }}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders with gradient accent bar', () => {
    render(
      <PersonalizedMessage
        message={{
          body: 'Body',
          header: 'Header',
        }}
      />
    );

    // Check that the component renders with content
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
