/**
 * Tests for discount calculation utilities
 */

import { calculateDiscountLabel } from './discount';

describe('calculateDiscountLabel', () => {
  it('calculates correct percentage for simple discount', () => {
    // $500 discounted from $625 = 20% off
    expect(calculateDiscountLabel(62500, 50000)).toBe('-20%');
  });

  it('rounds to nearest whole percentage', () => {
    // $279.20 discounted from $349 = 19.9...% rounds to 20%
    expect(calculateDiscountLabel(34900, 27920)).toBe('-20%');
  });

  it('rounds down when below .5', () => {
    // $340 discounted from $400 = 15% exactly
    expect(calculateDiscountLabel(40000, 34000)).toBe('-15%');
  });

  it('handles 10% discount', () => {
    // $90 discounted from $100 = 10% off
    expect(calculateDiscountLabel(10000, 9000)).toBe('-10%');
  });

  it('handles 50% discount', () => {
    // $250 discounted from $500 = 50% off
    expect(calculateDiscountLabel(50000, 25000)).toBe('-50%');
  });

  it('returns undefined when oldPriceCents is undefined', () => {
    expect(calculateDiscountLabel(undefined, 50000)).toBeUndefined();
  });

  it('returns undefined when oldPriceCents equals priceCents (no discount)', () => {
    expect(calculateDiscountLabel(50000, 50000)).toBeUndefined();
  });

  it('returns undefined when oldPriceCents is less than priceCents', () => {
    // Sanity check: old price shouldn't be less than new price
    expect(calculateDiscountLabel(40000, 50000)).toBeUndefined();
  });

  it('handles small discount percentages', () => {
    // $99 discounted from $100 = 1% off
    expect(calculateDiscountLabel(10000, 9900)).toBe('-1%');
  });

  it('handles large discount percentages', () => {
    // $10 discounted from $100 = 90% off
    expect(calculateDiscountLabel(10000, 1000)).toBe('-90%');
  });

  describe('edge cases', () => {
    it('returns undefined for zero oldPriceCents (prevents division by zero)', () => {
      expect(calculateDiscountLabel(0, 5000)).toBeUndefined();
    });

    it('returns undefined for negative oldPriceCents', () => {
      expect(calculateDiscountLabel(-10000, 5000)).toBeUndefined();
    });

    it('returns undefined for negative priceCents', () => {
      expect(calculateDiscountLabel(10000, -5000)).toBeUndefined();
    });

    it('returns undefined for NaN oldPriceCents', () => {
      expect(calculateDiscountLabel(NaN, 5000)).toBeUndefined();
    });

    it('handles 100% discount (priceCents = 0)', () => {
      expect(calculateDiscountLabel(10000, 0)).toBe('-100%');
    });
  });
});
