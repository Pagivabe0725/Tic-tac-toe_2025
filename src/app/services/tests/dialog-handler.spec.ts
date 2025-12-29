import { TestBed } from '@angular/core/testing';

import { DialogHandler } from '../dialog-handler.service';
import { provideZonelessChangeDetection } from '@angular/core';

/**
 * @fileoverview
 * Unit tests for the DialogHandler service.
 *
 * This suite verifies the functionality of the DialogHandler service, including:
 * - Getter methods (`actualContent`, `lastContent`, `dialogData`)
 * - Dialog operations (`open`, `close`, `emitData`)
 * - Event handling (`trigger`, `waitForTrigger`)
 *
 * The tests cover:
 * - Correct initialization and state of getters
 * - Proper resolution of Promises when data is emitted
 * - Correct triggering and subscription behavior for events
 * - Handling of multiple open dialogs and ensuring previous Promises are resolved correctly
 * - Resetting and cleanup of internal subjects and content upon closing
 *
 * The service is tested using Jasmine and Angular TestBed with zoneless change detection.
 */

describe('DialogHandler (service)', () => {
  /** The DialogHandler service instance under test. */
  let service: DialogHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DialogHandler);
  });

  /**
   * Tests for the DialogHandler getters.
   */
  describe('Getters:', () => {
    /**
     * Ensures that `actualContent`, `lastContent`, and `dialogData` return the expected values.
     * Verifies initial undefined state and updated values after assignment.
     */
    it('Should get `actualContent`, `lastContent`, and `dialogData` correctly', () => {
      // Verify initial undefined state
      expect(service.actualContent()).toBeUndefined();
      expect(service.lastContent).toBeUndefined();
      expect(service.dialogData).toBeUndefined();

      // Set values
      service.actualContent = 'save';
      service.lastContent = 'save';

      // Verify updated values
      expect(service.actualContent()).toBe('save');
      expect(service.lastContent).toBe('save');
      expect(service.dialogData).toEqual(undefined);
    });
  });

  /**
   * Tests for the emitData method.
   * Ensures data emission resolves the open Promise and closes the dialog.
   */
  describe('[emitData] function:', () => {
    /**
     * Emits data and verifies that the dialog is closed and the open Promise is resolved.
     */
    it('Should emit data and close the dialog', async () => {
      const spyClose = spyOn(service, 'close').and.callThrough();

      // Open dialog to initialize dataSubject
      const promise = service.open('save');
      service.emitData('result');

      await promise.then((result) => {
        expect(result).toBe('result');
      });

      expect(spyClose).toHaveBeenCalled();
      expect(service.actualContent()).toBeUndefined();
    });
  });

  /**
   * Tests for the waitForTrigger method.
   */
  describe('[waitForTrigger] function:', () => {
    /**
     * Returns an observable and ensures it emits the triggered value.
     */
    it('Should return an observable for triggers', (done) => {
      const observable$ = service.waitForTrigger();

      observable$.subscribe((value) => {
        expect(value).toBe('form');
        done();
      });

      service.trigger('form');
    });
  });

  /**
   * Tests for the trigger method.
   */
  describe('[trigger] function:', () => {
    /**
     * Ensures all subscribers receive the triggered event value.
     */
    it('Should trigger events to all subscribers', (done) => {
      const obs$ = service.waitForTrigger();

      obs$.subscribe((value) => {
        expect(value).toBe('reset');
        done();
      });

      service.trigger('reset');
    });
  });

  /**
   * Tests for the open method.
   */
  describe('[open] function:', () => {
    /**
     * Opens a dialog, sets content and data, and resolves with emitted data.
     */
    it('Should open a dialog and resolve with data', async () => {
      const openPromise = service.open('save', {
        title: 'test title',
        content: 'test content',
      });

      expect(service.actualContent()).toBe('save');
      expect(service.dialogData).toEqual({
        title: 'test title',
        content: 'test content',
      });
      expect(service.lastContent).toBe('save');

      service.emitData('my-result');

      const result = await openPromise;
      expect(result).toBe('my-result');

      expect(service.actualContent()).toBeUndefined();
      expect(service.dialogData).toEqual({
        title: 'test title',
        content: 'test content',
      });
    });

    /**
     * Ensures that opening a new dialog resolves the previous open Promise with null.
     */
    it('Should resolve previous open Promise with null if a new open is called', async () => {
      const firstPromise = service.open('save');
      const secondPromise = service.open('setting');

      const firstResult = await firstPromise;
      expect(firstResult).toBeNull();

      service.emitData('second-result');
      const secondResult = await secondPromise;

      expect(secondResult).toBe('second-result');

      expect(service.actualContent()).toBeUndefined();
      expect(service.lastContent).toBe('setting');
    });
  });

  /**
   * Tests for the close method.
   */
  describe('[close] function:', () => {
    /**
     * Closes the dialog, resets subjects and content, and resolves any open Promise with null.
     */
    it('Should close the dialog and reset subjects and content', async () => {
      const openPromise = service.open('save');

      expect(service.actualContent()).toBe('save');

      service.close();

      const result = await openPromise; // wait for Promise resolution
      expect(result).toBeNull();

      expect(service.actualContent()).toBeUndefined();
    });
  });
});
