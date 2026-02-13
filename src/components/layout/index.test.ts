/**
 * Tests for components/layout index exports
 */

import * as Layout from './index';

describe('Layout component exports', () => {
  it('exports Container', () => {
    expect(Layout.Container).toBeDefined();
  });
});
