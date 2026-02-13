/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import { NewRelicInitializer } from './NewRelicInitializer';

// Mock the newrelic-browser module
const mockInitNewRelicBrowser = jest.fn();
jest.mock('./newrelic-browser', () => ({
  initNewRelicBrowser: () => mockInitNewRelicBrowser(),
}));

describe('NewRelicInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null (no visible output)', () => {
    const { container } = render(<NewRelicInitializer />);
    expect(container.firstChild).toBeNull();
  });

  it('calls initNewRelicBrowser on mount', () => {
    render(<NewRelicInitializer />);
    expect(mockInitNewRelicBrowser).toHaveBeenCalledTimes(1);
  });

  it('only calls initNewRelicBrowser once even on re-render', () => {
    const { rerender } = render(<NewRelicInitializer />);
    expect(mockInitNewRelicBrowser).toHaveBeenCalledTimes(1);

    // Re-render should not call init again (empty dependency array)
    rerender(<NewRelicInitializer />);
    expect(mockInitNewRelicBrowser).toHaveBeenCalledTimes(1);
  });
});
