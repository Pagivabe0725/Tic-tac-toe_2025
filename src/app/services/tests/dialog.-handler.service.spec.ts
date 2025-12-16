import { TestBed } from '@angular/core/testing';
import { DialogHandler } from '../dialog-handler.service';
import { provideZonelessChangeDetection } from '@angular/core';

/**
 *
 * Unit tests for the {@link DialogHandler} service.
 *
 * This suite verifies:
 * - Getter/setter synchronization for the `actualContent` signal
 * - Correct behavior of public methods: `openDialog`, `close`, and `dailogEmitter`
 * - Proper reactive flow and cleanup after dialog closure
 */
describe('DialogHandler service', () => {
  let service: DialogHandler;

  /**
   * Initializes the Angular testing environment before each test.
   * Provides the {@link DialogHandler} service with zoneless change detection.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DialogHandler, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DialogHandler);
  });

  /**
   * @section Getter and Setter Tests
   *
   * Validates that the getter and setter for `actualContent`
   * properly synchronize the internal signal state.
   */
  describe('Getter and Setter', () => {
    /**
     * Ensures that the `actualContent` getter returns
     * the correct currently active dialog content.
     */
    it('actualContent getter should return the current value', () => {
      service.actualContent = 'login';
      expect(service.actualContent()).toBe('login');
    });

    /**
     * Ensures that setting `actualContent` directly updates
     * the underlying reactive signal and can be reset to undefined.
     */
    it('actualContent setter should update the value', () => {
      service.actualContent = 'registration';
      expect(service.actualContent()).toBe('registration');

      service.actualContent = undefined;
      expect(service.actualContent()).toBeUndefined();
    });
  });

  /**
   * @section Method Tests
   *
   * Validates that each public method of the service performs its expected behavior,
   * including signal updates, Subject emissions, and cleanup logic.
   */
  describe('Methods', () => {
    /**
     * Tests the {@link DialogHandler#openDialog} method.
     * Verifies that:
     * - `actualContent` is updated immediately when opened
     * - Emitted values resolve the promise
     * - The dialog closes automatically after resolving
     */
    it('openDialog should set actualContent and resolve with emitted value', async () => {
      const promise = service.open('save', undefined);

      // Initially, the content should be set
      expect(service.actualContent()).toBe('save');

      // Emit a value to complete the dialog
      service.emitData('success');

      const result = await promise;
      expect(result).toBe('success');
      expect(service.actualContent()).toBeUndefined(); // closed automatically
    });

    /**
     * Tests the {@link DialogHandler#close} method.
     * Ensures that calling `close()`:
     * - Clears the `actualContent` signal
     * - Completes the internal Subject (ending the dialog session)
     */
    it('close should reset actualContent and complete the dataSubject', async () => {
      service.actualContent = 'message';

      service.close();

      expect(service.actualContent()).toBeUndefined();
    });

    /**
     * Tests the {@link DialogHandler#dailogEmitter} method.
     * Ensures that:
     * - Emitting a value resolves the `openDialog` promise
     * - The dialog is properly closed afterward
     */
    it('dailogEmitter should push value to the open dialog', async () => {
      const promise = service.open('setting');
      service.emitData('ok');

      const result = await promise;
      expect(result).toBe('ok');
      expect(service.actualContent()).toBeUndefined();
    });
  });
});
