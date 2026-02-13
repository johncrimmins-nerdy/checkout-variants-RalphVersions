import { render, screen } from '@testing-library/react';

import Container from './Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default max-width of 1280px', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.maxWidth).toBe('1280px');
  });

  it('applies custom max-width when specified', () => {
    const { container } = render(
      <Container maxWidth="1440px">
        <div>Content</div>
      </Container>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.maxWidth).toBe('1440px');
  });

  it('applies no max-width when set to none', () => {
    const { container } = render(
      <Container maxWidth="none">
        <div>Content</div>
      </Container>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.maxWidth).toBe('');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('always applies mx-auto and w-full classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('mx-auto');
    expect(wrapper.className).toContain('w-full');
  });
});
