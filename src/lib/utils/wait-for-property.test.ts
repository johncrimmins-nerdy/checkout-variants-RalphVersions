/**
 * Tests for waitForProperty utility
 */

import { waitForProperty } from './wait-for-property';

describe('waitForProperty', () => {
  let testObject: Record<string, unknown>;

  beforeEach(() => {
    testObject = {};
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('immediate resolution', () => {
    it('should resolve immediately if property already exists', async () => {
      testObject.existingProp = 'existing value';

      const promise = waitForProperty(testObject, 'existingProp');
      const result = await promise;

      expect(result).toBe('existing value');
    });

    it('should resolve with typed value', async () => {
      testObject.typedProp = { foo: 'bar' };

      const result = await waitForProperty<{ foo: string }>(testObject, 'typedProp');

      expect(result.foo).toBe('bar');
    });
  });

  describe('deferred resolution', () => {
    it('should resolve when property is set after waiting', async () => {
      const promise = waitForProperty(testObject, 'laterProp');

      // Property doesn't exist yet
      expect(testObject.laterProp).toBeUndefined();

      // Set the property
      testObject.laterProp = 'set later';

      const result = await promise;
      expect(result).toBe('set later');
    });

    it('should resolve with the correct value when property is set', async () => {
      const promise = waitForProperty<{ id: number }>(testObject, 'complexProp');

      testObject.complexProp = { id: 123 };

      const result = await promise;
      expect(result).toEqual({ id: 123 });
    });

    it('should restore normal property behavior after resolution', async () => {
      const promise = waitForProperty(testObject, 'normalizedProp');

      testObject.normalizedProp = 'first value';
      await promise;

      // Should be able to set again normally
      testObject.normalizedProp = 'second value';
      expect(testObject.normalizedProp).toBe('second value');

      // Property should be writable and configurable
      const descriptor = Object.getOwnPropertyDescriptor(testObject, 'normalizedProp');
      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
    });
  });

  describe('timeout handling', () => {
    it('should reject after timeout if property is never set', async () => {
      const promise = waitForProperty(testObject, 'neverSet', { timeout: 1000 });

      // Advance time past timeout
      jest.advanceTimersByTime(1001);

      await expect(promise).rejects.toThrow('Timeout waiting for property "neverSet" after 1000ms');
    });

    it('should use default timeout of 10000ms', async () => {
      const promise = waitForProperty(testObject, 'defaultTimeout');

      // Advance time just under default timeout
      jest.advanceTimersByTime(9999);

      // Should still be pending (not rejected)
      let rejected = false;
      promise.catch(() => {
        rejected = true;
      });

      // Need to flush promise microtasks
      await Promise.resolve();
      expect(rejected).toBe(false);

      // Advance past timeout
      jest.advanceTimersByTime(2);

      await expect(promise).rejects.toThrow('Timeout waiting for property "defaultTimeout"');
    });

    it('should not reject if property is set before timeout', async () => {
      const promise = waitForProperty(testObject, 'beforeTimeout', { timeout: 5000 });

      // Set property before timeout
      jest.advanceTimersByTime(1000);
      testObject.beforeTimeout = 'in time';

      const result = await promise;
      expect(result).toBe('in time');

      // Advancing more should not cause issues
      jest.advanceTimersByTime(10000);
    });
  });

  describe('edge cases', () => {
    it('should handle null value', async () => {
      const promise = waitForProperty(testObject, 'nullProp');

      testObject.nullProp = null;

      // null is a valid value, should resolve
      const result = await promise;
      expect(result).toBeNull();
    });

    it('should handle false value', async () => {
      const promise = waitForProperty(testObject, 'falseProp');

      testObject.falseProp = false;

      const result = await promise;
      expect(result).toBe(false);
    });

    it('should handle zero value', async () => {
      const promise = waitForProperty(testObject, 'zeroProp');

      testObject.zeroProp = 0;

      const result = await promise;
      expect(result).toBe(0);
    });

    it('should handle empty string', async () => {
      const promise = waitForProperty(testObject, 'emptyString');

      testObject.emptyString = '';

      const result = await promise;
      expect(result).toBe('');
    });

    /**
     * This test intentionally sets the property multiple times in quick succession
     * to verify that only the FIRST assignment triggers the promise resolution.
     * The subsequent writes are NOT useless - they verify the "resolve once" behavior.
     */
    it('should only resolve once even if property is set multiple times', async () => {
      const promise = waitForProperty(testObject, 'multiSet');

      // Set property multiple times - only the first should be captured
      testObject.multiSet = 'first';
      testObject.multiSet = 'second'; // This write tests that promise already resolved
      testObject.multiSet = 'third'; // This write tests that subsequent sets work normally

      const result = await promise;
      expect(result).toBe('first');
    });

    it('should NOT resolve if property is explicitly set to undefined', async () => {
      const promise = waitForProperty(testObject, 'undefinedProp', { timeout: 100 });

      // Setting to undefined should NOT resolve the promise
      testObject.undefinedProp = undefined;

      // Advance time past timeout
      jest.advanceTimersByTime(150);

      // Should timeout because undefined is not considered "set"
      await expect(promise).rejects.toThrow('Timeout waiting for property "undefinedProp"');
    });
  });

  describe('window global simulation', () => {
    it('should work with window-like objects', async () => {
      const windowLike: Record<string, unknown> = {};

      const promise = waitForProperty<{ init: () => void }>(windowLike, 'testSDK');

      // Simulate external script setting the SDK
      windowLike.testSDK = {
        init: () => console.log('initialized'),
      };

      const sdk = await promise;
      expect(sdk).toBeDefined();
      expect(typeof sdk.init).toBe('function');
    });
  });

  describe('polling fallback', () => {
    it('should fall back to polling when property descriptor is not configurable', async () => {
      // Create an object with a non-configurable property descriptor
      const frozenTarget: Record<string, unknown> = {};

      // Define a non-configurable property (without a value yet)
      Object.defineProperty(frozenTarget, 'nonConfigurable', {
        configurable: false,
        enumerable: true,
        value: undefined,
        writable: true,
      });

      const promise = waitForProperty(frozenTarget, 'nonConfigurable', { timeout: 500 });

      // Set the property value (this will work because it's writable)
      frozenTarget.nonConfigurable = 'polled value';

      // Advance timers to allow polling to detect the change
      jest.advanceTimersByTime(100);

      const result = await promise;
      expect(result).toBe('polled value');
    });

    it('should timeout in polling mode if property is never set', async () => {
      const frozenTarget: Record<string, unknown> = {};

      // Define a non-configurable property
      Object.defineProperty(frozenTarget, 'neverSetProp', {
        configurable: false,
        enumerable: true,
        value: undefined,
        writable: true,
      });

      const promise = waitForProperty(frozenTarget, 'neverSetProp', { timeout: 200 });

      // Advance time past timeout without setting the property
      jest.advanceTimersByTime(250);

      await expect(promise).rejects.toThrow('Timeout waiting for property "neverSetProp"');
    });
  });
});
