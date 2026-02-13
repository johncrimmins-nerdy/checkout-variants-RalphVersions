/**
 * Tests for components/ui index exports
 */

import * as UI from './index';

describe('UI component exports', () => {
  it('exports Button', () => {
    expect(UI.Button).toBeDefined();
  });

  it('exports Card', () => {
    expect(UI.Card).toBeDefined();
  });

  it('exports ErrorMessage', () => {
    expect(UI.ErrorMessage).toBeDefined();
  });

  it('exports Input', () => {
    expect(UI.Input).toBeDefined();
  });

  it('exports Link', () => {
    expect(UI.Link).toBeDefined();
  });

  it('exports Spinner', () => {
    expect(UI.Spinner).toBeDefined();
  });
});
