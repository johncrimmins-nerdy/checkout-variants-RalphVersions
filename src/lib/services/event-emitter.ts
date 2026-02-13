/**
 * Simple event emitter for managing events across the application
 */

type EventCallback = (...args: unknown[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Emit an event
   * @param event - Event name
   * @param args - Arguments to pass to listeners
   */
  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove an event listener
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Register an event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  /**
   * Register a one-time event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback: EventCallback = (...args: unknown[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Remove all listeners for an event
   * @param event - Event name (if not provided, removes all listeners)
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export default EventEmitter;
