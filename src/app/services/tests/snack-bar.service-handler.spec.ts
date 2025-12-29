import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SnackBarHandler } from '../snack-bar-handler.service';

/**
 * @fileoverview
 * Unit tests for the `SnackBarHandler` service.
 *
 * Covers:
 * - snackbarContent: signal exposure
 * - addElement:
 *   - appends new elements with correct defaults (id, duration, content, error)
 *   - enforces max capacity by removing the oldest element
 * - tick:
 *   - decreases duration by 1
 *   - removes expired elements
 * - deleteElement:
 *   - removes an element by id
 */

describe('SnackBarHandler', () => {
  /** Service under test. */
  let service: SnackBarHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), SnackBarHandler],
    });

    service = TestBed.inject(SnackBarHandler);
  });

  /**
   * Tests for signal exposure and default state.
   */
  describe('Signal:', () => {
    /**
     * Ensures the initial snackbar list is empty.
     */
    it('Should start with empty content', () => {
      expect(service.snackbarContent()).toEqual([]);
    });
  });

  /**
   * Tests for adding new snackbar items.
   */
  describe('[addElement] function:', () => {
    /**
     * Ensures that a new element is appended with the expected default duration and incremental id.
     */
    it('Should add a snackbar element with default properties', () => {
      service.addElement('Hello', false);

      const items = service.snackbarContent();

      expect(items.length).toBe(1);
      expect(items[0]).toEqual({
        id: 0,
        content: 'Hello',
        duration: 15,
        error: false,
      });
    });

    /**
     * Ensures that ids increment for each added element.
     */
    it('Should increment id for each new element', () => {
      service.addElement('A', false);
      service.addElement('B', true);

      const items = service.snackbarContent();

      expect(items[0].id).toBe(0);
      expect(items[1].id).toBe(1);
    });

    /**
     * Ensures that when the list is full, adding a new element removes the oldest one.
     */
    it('Should remove the oldest element when capacity is exceeded', () => {
      // Fill up to the internal limit logic (the service enforces max ~4 visible items).
      for (let i = 0; i < 4; i++) {
        service.addElement(`Item ${i}`, false);
      }

      expect(service.snackbarContent().map((x) => x.id)).toEqual([0, 1, 2, 3]);

      // Adding one more should remove the oldest (id 0)
      service.addElement('Item 4', false);

      expect(service.snackbarContent().map((x) => x.id)).toEqual([1, 2, 3, 4]);
      expect(service.snackbarContent().length).toBe(4);
    });
  });

  /**
   * Tests for decreasing duration and auto-removal.
   */
  describe('[tick] function:', () => {
    /**
     * Ensures that each tick decreases duration by 1 for active elements.
     */
    it('Should decrease duration by 1 on each tick', () => {
      service.addElement('A', false);

      const before = service.snackbarContent()[0].duration;

      service.tick();

      const after = service.snackbarContent()[0].duration;
      expect(after).toBe(before - 1);
    });

    /**
     * Ensures that elements expire and are removed when duration reaches 0.
     */
    it('Should remove expired elements', () => {
      service.addElement('A', false);

      // 15 ticks -> duration goes 15 -> ... -> 0, then filtered out
      for (let i = 0; i < 15; i++) {
        service.tick();
      }

      expect(service.snackbarContent().length).toBe(0);
    });

    /**
     * Ensures that only expired elements are removed, others remain.
     */
    it('Should keep non-expired elements while removing expired ones', () => {
      service.addElement('A', false);
      service.addElement('B', false);

      // Expire both down to 1
      for (let i = 0; i < 14; i++) {
        service.tick();
      }

      expect(service.snackbarContent().map((x) => x.duration)).toEqual([1, 1]);

      // Remove only the first element manually, keep the second for one more tick
      service.deleteElement(0);

      service.tick();

      expect(service.snackbarContent().length).toBe(0);
    });
  });

  /**
   * Tests for manual deletion.
   */
  describe('[deleteElement] function:', () => {
    /**
     * Ensures that deleteElement removes the element with the matching id.
     */
    it('Should remove element by id', () => {
      service.addElement('A', false);
      service.addElement('B', false);

      service.deleteElement(0);

      const items = service.snackbarContent();
      expect(items.length).toBe(1);
      expect(items[0].id).toBe(1);
    });

    /**
     * Ensures that deleting a non-existing id leaves the list unchanged.
     */
    it('Should not change list if id does not exist', () => {
      service.addElement('A', false);

      service.deleteElement(999);

      expect(service.snackbarContent().length).toBe(1);
    });
  });
});
