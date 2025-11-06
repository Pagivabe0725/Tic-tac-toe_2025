import { inject, Injectable } from '@angular/core';
import { game } from '../utils/interfaces/game.interface';
import {
  FieldKey,
  FormField,
} from '../utils/types/dialog-form-field-model.type';
import { FormTemplate } from './form-template.service';

/**
 * A utility service that provides reusable helper functions
 * for data transformation and common logic used across the application.
 *
 * @remarks
 * This service is marked as `providedIn: 'root'`, meaning it is a singleton
 * available throughout the entire Angular application.
 */
@Injectable({
  providedIn: 'root',
})
export class Functions {
  /**
   * Creates a new object by extracting a subset of properties from another object.
   *
   * This is useful when you need to safely copy or select only specific keys
   * from a larger object (for example, when creating lightweight DTOs or sending
   * sanitized data to a backend).
   *
   * @typeParam T - The type of the target object that defines the expected structure.
   * @param object - The source object to pick keys from.
   * @param keys - An array of property keys to include in the new object.
   * @returns A new object containing only the specified keys from the source.
   *
   * @example
   * ```ts
   * const user = { id: 1, name: 'Alice', password: 'secret' };
   * const publicData = this.functions.pick<{ id: number; name: string }>(user, ['id', 'name']);
   * // → { id: 1, name: 'Alice' }
   * ```
   */
  pick<T>(object: any, keys: (keyof T)[]): T {
    const result: Partial<T> = {};
    keys.forEach((key) => {
      if (object[key] !== undefined) result[key] = object[key];
    });
    return result as T;
  }

  /**
   * Converts a numeric difficulty value (1–4) back into its corresponding string.
   *
   * - `1` → `'very-easy'`
   * - `2` → `'easy'`
   * - `3` → `'medium'`
   * - `4` → `'hard'`
   *
   * @param value - Numeric difficulty (1–4)
   * @returns Difficulty level string
   */
  numberToDifficulty(value: number): game['hardness'] {
    switch (value) {
      case 1:
        return 'very-easy';
      case 2:
        return 'easy';
      case 3:
        return 'medium';
      case 4:
        return 'hard';
      default:
        return 'very-easy'; // fallback
    }
  }

  /**
   * Creates a type-safe object where each key corresponds to the `model`
   * field of the given form fields, and the values are initialized as `undefined`.
   *
   * This is useful for generating empty, strongly-typed form data objects.
   *
   * @typeParam T - The resulting object type.
   * @param fieldKey - The logical key identifying the form section.
   * @param formFields - The array of `FormField` definitions for that section.
   * @returns A typed object with each model key set to `undefined`.
   *
   * @example
   * ```ts
   * const emptyLoginModel = this.specificFieldTypeByName('login', [
   *   { model: 'email', type: 'text', ... },
   *   { model: 'password', type: 'password', ... },
   * ]);
   * // Result type:
   * // { email?: string | number | string[] | number[]; password?: string | number | string[] | number[] }
   * ```
   */
  specificFieldTypeByName<
    T extends Record<string, string | number | string[] | number[]>
  >(fieldKey: FieldKey, formFields: FormField[]): T {
    const result: Partial<T> = {};

    for (const field of formFields) {
      // Initialize each field model key as undefined
      result[field.model as keyof T] = undefined as unknown as T[keyof T];
    }

    return result as T;
  }
}
