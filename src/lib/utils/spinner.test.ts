/**
 * @jest-environment jsdom
 */

/**
 * Tests for spinner utility functions
 */

import { hideSpinner, showSpinner } from './spinner';

describe('spinner utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('hideSpinner', () => {
    it('hides spinner element with default ID', () => {
      const spinner = document.createElement('div');
      spinner.id = 'spinner';
      spinner.style.display = 'flex';
      document.body.appendChild(spinner);

      hideSpinner();

      expect(spinner.style.display).toBe('none');
    });

    it('hides spinner element with custom ID', () => {
      const spinner = document.createElement('div');
      spinner.id = 'custom-spinner';
      spinner.style.display = 'flex';
      document.body.appendChild(spinner);

      hideSpinner('custom-spinner');

      expect(spinner.style.display).toBe('none');
    });

    it('does nothing if spinner not found', () => {
      // Should not throw
      expect(() => hideSpinner()).not.toThrow();
    });
  });

  describe('showSpinner', () => {
    it('shows spinner element with default ID', () => {
      const spinner = document.createElement('div');
      spinner.id = 'spinner';
      spinner.style.display = 'none';
      document.body.appendChild(spinner);

      showSpinner();

      expect(spinner.style.display).toBe('flex');
    });

    it('shows spinner element with custom ID', () => {
      const spinner = document.createElement('div');
      spinner.id = 'loading';
      spinner.style.display = 'none';
      document.body.appendChild(spinner);

      showSpinner('loading');

      expect(spinner.style.display).toBe('flex');
    });

    it('does nothing if spinner not found', () => {
      // Should not throw
      expect(() => showSpinner()).not.toThrow();
    });
  });
});
