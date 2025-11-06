import { inject, Injectable } from '@angular/core';
import { game } from '../utils/interfaces/game.interface';
import {
  FieldKey,
  FormField,
} from '../utils/types/dialog-form-field-model.type';
import { FormTemplate } from './form-template.service';

/**
 * A utility service that provides reusable helper functions
 * for data transformation, mapping, type conversion and common logic
 * used across the application.
 *
 * @remarks
 * This service is marked as `providedIn: 'root'`, meaning it is a singleton
 * and shared across the entire Angular app.
 */
@Injectable({
  providedIn: 'root',
})
export class Functions {
  /**
   * Creates a new object by selecting a specific set of keys from the source object.
   *
   * This is useful when constructing DTOs, filtering out sensitive fields,
   * or extracting only the relevant subset of data from a larger structure.
   *
   * @typeParam T - The target type that defines the resulting object structure.
   * @param object - The input object to extract values from.
   * @param keys - The list of property keys to include in the output.
   * @returns A new object containing only the requested keys.
   *
   * @example
   * ```ts
   * const full = { id: 1, name: 'Alice', password: 'secret' };
   * const safe = functions.pick<{ id: number; name: string }>(full, ['id', 'name']);
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
   * Converts a numeric difficulty value (1–4) into its corresponding
   * difficulty string literal.
   *
   * This is the inverse of `getDifficultyValue()`.
   *
   * Mapping:
   * - `1` → `'very-easy'`
   * - `2` → `'easy'`
   * - `3` → `'medium'`
   * - `4` → `'hard'`
   *
   * @param value - The numeric difficulty level.
   * @returns The corresponding `game['hardness']` string.
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
   * Creates a strongly-typed form model object from the provided form field
   * definitions, using each field's `model` key as a property name.
   *
   * - If `baseValue` is defined, it is used as the initial value.
   * - Otherwise, the property is initialized as `undefined`.
   *
   * This is primarily used to generate:
   * - typed default form models,
   * - empty objects for reactive form sections,
   * - type-safe object shapes for emitted result values.
   *
   * @typeParam T - The expected object shape whose keys match the form field `model` values.
   * @param fieldKey - A logical identifier for the current field group.
   * @param formFields - The form field metadata definitions.
   * @returns An object typed as `T` with initialized keys.
   *
   * @example
   * ```ts
   * const model = specificFieldTypeByName('settings', [
   *   { model: 'size', type: 'select', baseValue: 3 },
   *   { model: 'hardness', type: 'select' }
   * ]);
   *
   * // → { size: 3, hardness: undefined }
   * ```
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
   * Converts a raw input value (usually from a form) into a strongly-typed
   * and consistent representation based on the given target type.
   *
   * Supports:
   * - `'string'`
   * - `'number'`
   * - `'boolean'`
   * - `'string[]'`
   * - `'number[]'`
   *
   * This function ensures that select inputs, range inputs, and text inputs
   * all produce the correct type at the point of form submission.
   *
   * @param value - The raw value (string/number/boolean/array/unknown).
   * @param targetType - The desired output type.
   * @returns The converted value, or the original value if conversion fails.
   *
   * @example
   * ```ts
   * convertType("3", "number");   // → 3
   * convertType("true", "boolean"); // → true
   * convertType("5", "number[]"); // → [5]
   * convertType(7, "string");     // → "7"
   * ```
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
}
