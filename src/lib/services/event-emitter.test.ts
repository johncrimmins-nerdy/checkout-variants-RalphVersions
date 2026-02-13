/**
 * Tests for EventEmitter
 */

import { EventEmitter } from './event-emitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on', () => {
    it('should register an event listener', () => {
      const callback = jest.fn();
      emitter.on('test', callback);

      emitter.emit('test');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple listeners for the same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.emit('test');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should allow same listener to be added multiple times', () => {
      const callback = jest.fn();

      emitter.on('test', callback);
      emitter.on('test', callback);

      emitter.emit('test');
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('emit', () => {
    it('should call listeners with provided arguments', () => {
      const callback = jest.fn();
      emitter.on('test', callback);

      emitter.emit('test', 'arg1', 123, { key: 'value' });
      expect(callback).toHaveBeenCalledWith('arg1', 123, { key: 'value' });
    });

    it('should not throw if no listeners registered', () => {
      expect(() => emitter.emit('nonexistent')).not.toThrow();
    });

    it('should handle listener errors without stopping other listeners', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const successCallback = jest.fn();

      // Mock console.error to suppress output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.on('test', errorCallback);
      emitter.on('test', successCallback);

      emitter.emit('test');

      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const callback = jest.fn();
      emitter.on('test', callback);

      emitter.off('test', callback);
      emitter.emit('test');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should only remove the specific listener', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.off('test', callback1);
      emitter.emit('test');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle removing non-existent listener', () => {
      const callback = jest.fn();
      expect(() => emitter.off('test', callback)).not.toThrow();
    });

    it('should handle removing from non-existent event', () => {
      const callback = jest.fn();
      expect(() => emitter.off('nonexistent', callback)).not.toThrow();
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      const callback = jest.fn();
      emitter.once('test', callback);

      emitter.emit('test');
      emitter.emit('test');
      emitter.emit('test');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to one-time listener', () => {
      const callback = jest.fn();
      emitter.once('test', callback);

      emitter.emit('test', 'arg1', 'arg2');
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should work with regular on() listeners', () => {
      const onceCallback = jest.fn();
      const regularCallback = jest.fn();

      // Register regular listener first, then once listener
      emitter.on('test', regularCallback);
      emitter.once('test', onceCallback);

      emitter.emit('test');
      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(1);

      emitter.emit('test');
      expect(onceCallback).toHaveBeenCalledTimes(1); // Still 1 - it was removed
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for a specific event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const otherCallback = jest.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);
      emitter.on('other', otherCallback);

      emitter.removeAllListeners('test');

      emitter.emit('test');
      emitter.emit('other');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(otherCallback).toHaveBeenCalled();
    });

    it('should remove all listeners for all events when no event specified', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on('test1', callback1);
      emitter.on('test2', callback2);

      emitter.removeAllListeners();

      emitter.emit('test1');
      emitter.emit('test2');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle removing listeners from non-existent event', () => {
      expect(() => emitter.removeAllListeners('nonexistent')).not.toThrow();
    });
  });
});
