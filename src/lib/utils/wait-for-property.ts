/**
 * Utility to wait for a property to be set on an object.
 *
 * Uses Object.defineProperty to intercept property assignment and resolve
 * a promise when the property is set. Useful for waiting on global variables
 * set by external scripts.
 *
 * IMPORTANT: This must be called BEFORE the property is set, otherwise
 * use the immediate resolution path for already-existing properties.
 */

interface WaitForPropertyOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
}

/**
 * Wait for a property to be set on an object.
 *
 * NOTE: This function checks if the property value is not `undefined` to determine
 * if it's "set". If a property is explicitly set to `undefined`, the promise will
 * NOT resolve. This is intentional for the use case of waiting for external scripts
 * that set meaningful values (objects, functions, etc.).
 *
 * @param target - The object to watch (e.g., window)
 * @param propertyName - The property name to watch for
 * @param options - Optional configuration
 * @returns Promise that resolves with the property value when set (and not undefined)
 *
 * @example
 * ```typescript
 * // Wait for a script to set window.grecaptcha
 * const grecaptcha = await waitForProperty(window, 'grecaptcha');
 *
 * // With timeout
 * const sdk = await waitForProperty(window, 'someSDK', { timeout: 5000 });
 * ```
 */
export function waitForProperty<T = unknown>(
  target: object,
  propertyName: string,
  options: WaitForPropertyOptions = {}
): Promise<T> {
  const { timeout = 10000 } = options;

  return new Promise<T>((resolve, reject) => {
    const record = target as Record<string, unknown>;

    // Check if property already exists and is defined
    if (propertyName in target && record[propertyName] !== undefined) {
      resolve(record[propertyName] as T);
      return;
    }

    // Set up timeout
    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    let resolved = false;

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Timeout waiting for property "${propertyName}" after ${timeout}ms`));
        }
      }, timeout);
    }

    // Helper to clean up and resolve
    const resolveWith = (value: T) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(value);
    };

    // Check if we can define property (might already have a non-configurable descriptor)
    const existingDescriptor = Object.getOwnPropertyDescriptor(target, propertyName);
    if (existingDescriptor && !existingDescriptor.configurable) {
      // Can't redefine, fall back to polling
      pollForProperty(target, propertyName, timeout, resolveWith, reject);
      return;
    }

    // Internal storage for the value
    let internalValue: T | undefined;

    // Define the property with getter/setter to intercept assignment
    Object.defineProperty(target, propertyName, {
      configurable: true,
      enumerable: true,
      get() {
        return internalValue;
      },
      set(value: T) {
        internalValue = value;

        // Restore normal property behavior (no getter/setter overhead after first set)
        Object.defineProperty(target, propertyName, {
          configurable: true,
          enumerable: true,
          value: value,
          writable: true,
        });

        // Only resolve if value is not undefined (consistent with initial check)
        if (value !== undefined) {
          resolveWith(value);
        }
      },
    });
  });
}

/**
 * Fallback polling implementation for when property descriptors can't be used.
 * Tracks the poll timeout to ensure proper cleanup when the promise settles.
 */
function pollForProperty<T>(
  target: object,
  propertyName: string,
  timeout: number,
  resolve: (value: T) => void,
  reject: (error: Error) => void
): void {
  const record = target as Record<string, unknown>;
  const startTime = Date.now();
  const pollInterval = 50;

  let pollTimeoutId: null | ReturnType<typeof setTimeout> = null;
  let settled = false;

  const cleanup = () => {
    if (pollTimeoutId !== null) {
      clearTimeout(pollTimeoutId);
      pollTimeoutId = null;
    }
  };

  const safeResolve = (value: T) => {
    if (settled) return;
    settled = true;
    cleanup();
    resolve(value);
  };

  const safeReject = (error: Error) => {
    if (settled) return;
    settled = true;
    cleanup();
    reject(error);
  };

  const poll = () => {
    if (settled) return;

    if (propertyName in target && record[propertyName] !== undefined) {
      safeResolve(record[propertyName] as T);
      return;
    }

    if (Date.now() - startTime >= timeout) {
      safeReject(new Error(`Timeout waiting for property "${propertyName}" after ${timeout}ms`));
      return;
    }

    pollTimeoutId = setTimeout(poll, pollInterval);
  };

  poll();
}
