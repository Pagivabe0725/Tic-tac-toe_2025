import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Functions } from '../functions.service';
import { Hardness } from '../../utils/types/hardness.type';
import { FormField } from '../../utils/interfaces/form-field-template.interface';
import { FieldKey } from '../../utils/types/dialog-form-field-model.type';
import { GameSettings } from '../../utils/interfaces/game-settings.interface';
import { SavedGame } from '../../utils/interfaces/saved-game.interface';

/**
 * @fileoverview
 * Unit tests for the `Functions` service.
 *
 * Covers:
 * - pick: extracts a subset of keys from an object
 * - numberToDifficulty / difficultyToNumber: hardness mapping helpers
 * - specificFieldTypeByName: builds a typed object from form field metadata
 * - convertType: converts raw inputs into requested target types
 * - markupByStep: returns 'o' for even steps and 'x' for odd steps
 */

describe('Functions', () => {
  /** Service under test. */
  let service: Functions;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), Functions],
    });

    service = TestBed.inject(Functions);
  });

  /**
   * Tests for the `pick` helper.
   */
  describe('[pick] function:', () => {
    /**
     * Should return a new object containing only the requested keys.
     */
    it('Should pick only the provided keys from the object', () => {
      const source = { a: 1, b: 2, c: 3 };

      const result = service.pick<{ a: number; c: number }>(source, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    /**
     * Should skip keys that are undefined on the source object.
     */
    it('Should not include keys with undefined values', () => {
      const source = { a: 1, b: undefined, c: 3 };

      const result = service.pick<{ a: number; b: number; c: number }>(source, [
        'a',
        'b',
        'c',
      ]);

      expect('b' in result).toBeFalse();
    });
  });

  /**
   * Tests for the `numberToDifficulty` helper.
   */
  describe('[numberToDifficulty] function:', () => {
    /**
     * Maps valid numbers to the expected hardness values.
     */
    it('Should map numbers 1-4 to the correct difficulty values', () => {
      expect(service.numberToDifficulty(1)).toBe('very_easy');
      expect(service.numberToDifficulty(2)).toBe('easy');
      expect(service.numberToDifficulty(3)).toBe('medium');
      expect(service.numberToDifficulty(4)).toBe('hard');
    });

    /**
     * Falls back to `very_easy` for out-of-range values.
     */
    it('Should fallback to `very_easy` for invalid numbers', () => {
      expect(service.numberToDifficulty(0)).toBe('very_easy');
      expect(service.numberToDifficulty(999)).toBe('very_easy');
    });
  });

  /**
   * Tests for the `difficultyToNumber` helper.
   */
  describe('[difficultyToNumber] function:', () => {
    /**
     * Maps hardness values back to their numeric representation.
     */
    it('Should map difficulties to the correct numbers', () => {
      expect(service.difficultyToNumber('very_easy')).toBe(1);
      expect(service.difficultyToNumber('easy')).toBe(2);
      expect(service.difficultyToNumber('medium')).toBe(3);
      expect(service.difficultyToNumber('hard')).toBe(4);
      expect(service.difficultyToNumber('a' as SavedGame['difficulty'])).toBe(
        1
      );
    });
  });

  /**
   * Tests for the `specificFieldTypeByName` helper.
   */
  describe('[specificFieldTypeByName] function:', () => {
    /**
     * Uses `baseValue` when present, otherwise sets the key to `undefined`.
     */
    it('Should build an object from form fields using baseValue or undefined', () => {
      const fields = [
        { model: 'email', baseValue: 'a@a.com' },
        { model: 'size', baseValue: 4 },
        { model: 'opponent' }, // no baseValue
      ] as unknown as FormField[];

      const result = service.specificFieldTypeByName<{
        email: string;
        size: number;
        opponent: string;
      }>('login' as FieldKey, fields);

      expect(result.email).toBe('a@a.com');
      expect(result.size).toBe(4);
      expect(result.opponent).toBeUndefined();
    });
  });

  /**
   * Tests for the `convertType` helper.
   */
  describe('[convertType] function:', () => {
    /**
     * Returns the value as-is when it is null/undefined.
     */
    it('Should return nullish values unchanged', () => {
      expect(service.convertType(null, 'string')).toBeNull();
      expect(service.convertType(undefined, 'number')).toBeUndefined();
    });

    /**
     * Converts values to string.
     */
    it('Should convert values to string', () => {
      expect(service.convertType(123, 'string')).toBe('123');
      expect(service.convertType(true, 'string')).toBe('true');
    });

    /**
     * Converts numeric strings to numbers, but keeps original value if NaN.
     */
    it('Should convert values to number when possible', () => {
      expect(service.convertType('12', 'number')).toBe(12);
      expect(service.convertType('abc', 'number')).toBe('abc');
    });

    /**
     * Converts values to boolean using the service rules.
     */
    it('Should convert values to boolean', () => {
      expect(service.convertType(true, 'boolean')).toBeTrue();
      expect(service.convertType(false, 'boolean')).toBeFalse();
      expect(service.convertType('true', 'boolean')).toBeTrue();
      expect(service.convertType('false', 'boolean')).toBeFalse();
      expect(service.convertType(0, 'boolean')).toBeFalse();
      expect(service.convertType(1, 'boolean')).toBeTrue();
    });

    /**
     * Converts values to string arrays.
     */
    it('Should convert values to string[]', () => {
      expect(service.convertType('a', 'string[]')).toEqual(['a']);
      expect(service.convertType([1, 'b'], 'string[]')).toEqual(['1', 'b']);
    });

    /**
     * Converts values to number arrays, converting numeric items when possible.
     */
    it('Should convert values to number[]', () => {
      expect(service.convertType('5', 'number[]')).toEqual([5]);
      expect(service.convertType(['1', 2, 'x'], 'number[]')).toEqual([
        1,
        2,
        'x',
      ]);
    });
  });

  /**
   * Tests for the `markupByStep` helper.
   */
  describe('[markupByStep] function:', () => {
    /**
     * Even steps return 'o', odd steps return 'x'.
     */
    it('Should return `o` for even steps and `x` for odd steps', () => {
      expect(service.markupByStep(0)).toBe('o');
      expect(service.markupByStep(1)).toBe('x');
      expect(service.markupByStep(2)).toBe('o');
      expect(service.markupByStep(3)).toBe('x');
    });
  });
});
