/**
 * Tests for hooks/use-flags index exports
 */

import * as UseFlags from './index';

describe('use-flags module exports', () => {
  it('exports FLAGS constant', () => {
    expect(UseFlags.FLAGS).toBeDefined();
    expect(typeof UseFlags.FLAGS).toBe('object');
  });

  it('exports useFlags hook', () => {
    expect(UseFlags.useFlags).toBeDefined();
    expect(typeof UseFlags.useFlags).toBe('function');
  });
});
