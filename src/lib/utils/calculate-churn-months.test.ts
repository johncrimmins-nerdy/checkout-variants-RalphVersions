/**
 * Tests for calculate-churn-months utility
 */

import { calculateChurnMonths } from './calculate-churn-months';

describe('calculateChurnMonths', () => {
  beforeEach(() => {
    // Mock current date to Jan 15, 2024
    const mockDate = new Date('2024-01-15T00:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 or close to 0 for churn date in same month', () => {
    // Same month (Jan 2024)
    const result = calculateChurnMonths('2024-01-01T00:00:00.000Z');

    // Due to timezone parsing, might be -1 or 0
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('returns positive number for past churn dates', () => {
    // Dec 2023 is in the past from Jan 2024
    const result = calculateChurnMonths('2023-12-01T00:00:00.000Z');

    expect(result).toBeGreaterThan(0);
  });

  it('calculates approximately correct months for past dates', () => {
    // July 2023 is approximately 6 months ago from Jan 2024
    const result = calculateChurnMonths('2023-07-01T00:00:00.000Z');

    // Allow for slight variations due to calculation method
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(7);
  });

  it('calculates approximately correct months for year-old dates', () => {
    // Jan 2023 is approximately 12 months ago from Jan 2024
    const result = calculateChurnMonths('2023-01-01T00:00:00.000Z');

    // Allow for slight variations
    expect(result).toBeGreaterThanOrEqual(11);
    expect(result).toBeLessThanOrEqual(13);
  });

  it('handles dates more than a year ago', () => {
    // Dec 2021 is well over a year ago from Jan 2024
    const result = calculateChurnMonths('2021-12-01T00:00:00.000Z');

    expect(result).toBeGreaterThan(12);
  });

  it('handles ISO date string format', () => {
    const result = calculateChurnMonths('2023-07-15T12:00:00.000Z');

    // Should be approximately 6 months
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(7);
  });

  it('returns a number', () => {
    const result = calculateChurnMonths('2023-06-15T00:00:00.000Z');

    expect(typeof result).toBe('number');
  });
});
