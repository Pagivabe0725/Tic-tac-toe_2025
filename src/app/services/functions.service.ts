import { Injectable } from '@angular/core';

import { FieldKey } from '../utils/types/dialog-form-field-model.type';
import { FormField } from '../utils/interfaces/form-field-template.interface';
import { Hardness } from '../utils/types/hardness.type';

@Injectable({
  providedIn: 'root',
})
export class Functions {
  /**
   * Creates a new object by selecting a specific set of keys from the source object.
   *
   * Useful for constructing DTOs, filtering sensitive fields, or extracting relevant subsets of data.
   *
   * @typeParam T - Target type defining the structure of the returned object.
   * @param object - Source object to extract values from.
   * @param keys - Array of property keys to include in the output.
   * @returns A new object containing only the requested keys.
   */
  pick<T>(object: any, keys: (keyof T)[]): T {
    const result: Partial<T> = {};
    keys.forEach((key) => {
      if (object[key] !== undefined) result[key] = object[key];
    });
    return result as T;
  }

  /**
   * Converts a numeric difficulty value (1–4) into its corresponding string literal.
   *
   * Mapping:
   * - 1 → 'very-easy'
   * - 2 → 'easy'
   * - 3 → 'medium'
   * - 4 → 'hard'
   *
   * @param value - Numeric difficulty level (1–4)
   * @returns Corresponding `game['hardness']` string
   */
  numberToDifficulty(value: number): Hardness {
    switch (value) {
      case 1:
        return 'very_easy';
      case 2:
        return 'easy';
      case 3:
        return 'medium';
      case 4:
        return 'hard';
      default:
        return 'very_easy';
    }
  }

  /**
   * Converts a difficulty string literal into its corresponding numeric value (1–4).
   *
   * Mapping:
   * - 'very_easy' → 1
   * - 'easy' → 2
   * - 'medium' → 3
   * - 'hard' → 4
   *
   * @param difficulty - Difficulty string from the `Hardness` enum
   * @returns Numeric difficulty level (1–4)
   */
  difficultyToNumber(difficulty: Hardness): number {
    switch (difficulty) {
      case 'very_easy':
        return 1;
      case 'easy':
        return 2;
      case 'medium':
        return 3;
      case 'hard':
        return 4;
      default:
        return 1; // fallback – consistent with your original function
    }
  }

  /**
   * Creates a strongly-typed form model object from an array of form field definitions.
   *
   * - Uses `baseValue` if defined; otherwise initializes as `undefined`.
   * - Useful for creating typed default form models, empty reactive form objects, or type-safe emitted values.
   *
   * @typeParam T - Expected object shape matching the form field `model` values
   * @param fieldKey - Logical identifier for the field group
   * @param formFields - Array of `FormField` metadata definitions
   * @returns Object typed as `T` with initialized keys
   */
  specificFieldTypeByName<T extends Record<string, string | number>>(
    fieldKey: FieldKey,
    formFields: FormField[]
  ): T {
    const result: Partial<T> = {};

    for (const field of formFields) {
      if ('baseValue' in field) {
        result[field.model as keyof T] = field.baseValue as any;
      } else {
        result[field.model as keyof T] = undefined as unknown as T[keyof T];
      }
    }

    return result as T;
  }

  /**
   * Converts a raw input value from a form into a strongly-typed, consistent representation.
   *
   * Supported types: 'string', 'number', 'boolean', 'string[]', 'number[]'.
   * Ensures that all inputs (select, range, text) produce the correct type for submission.
   *
   * @param value - Raw input value
   * @param targetType - Desired output type
   * @returns Converted value of the specified type, or original value if conversion fails
   */
  convertType(
    value: unknown,
    targetType: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]'
  ): unknown {
    if (value == null) return value;
    if (typeof value === targetType) return value;

    switch (targetType) {
      case 'string':
        return String(value);

      case 'number':
        const num = Number(value);
        return isNaN(num) ? value : num;

      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);

      case 'string[]':
        if (Array.isArray(value)) {
          return value.map((v) => String(v));
        }
        return [String(value)];

      case 'number[]':
        if (Array.isArray(value)) {
          return value.map((v) => {
            const n = Number(v);
            return isNaN(n) ? v : n;
          });
        }
        const nVal = Number(value);
        return isNaN(nVal) ? [value] : [nVal];

      default:
        return value;
    }
  }

  /**
   * Determines the markup ('o' or 'x') based on the actual step number.
   *
   * Logic:
   *  - If step is even → returns 'o'
   *  - If step is odd → returns 'x'
   *
   * @param {number} step - The current step number in the game.
   * @returns {'o' | 'x'} - The markup character representing the next player.
   */
  markupByStep(step: number): 'o' | 'x' {
    return step % 2 === 0 ? 'o' : 'x';
  }
}
