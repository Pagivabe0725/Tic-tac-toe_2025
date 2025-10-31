import { FieldKey, FormField } from '../types/dialog-form-field-model.type';

/**
 * A map of dialog sections to their corresponding form fields.
 *
 * Each key in the map (`FieldKey`) represents a logical section of the dialog,
 * for example: "game_setting", "save", "setting", "login", or "registration".
 *
 * The value for each key is an array of `FormField` objects that define the fields
 * in that section, including:
 * - `field`: The unique identifier of the form field (used in templates or form controls)
 * - `title`: The human-readable label shown to the user
 * - `type`: The input type (e.g., "text", "select", "range", "color", "password")
 * - `model`: The corresponding `FormFieldModel` used in the component logic
 * - `options` (optional): The allowed values for select fields
 * - `min` / `max` (optional): The range limits for range inputs
 * - `errorKeys` (optional): An array of validation keys (ErrorKeys) to check for this field.
 *   These keys are used by the `Form` service to automatically validate fields
 *   and generate error messages. This helps ensure the form dynamically applies
 *   the correct validation logic per field.
 *
 * @remarks
 * - This map provides a single source of truth for dynamically generating form
 *   inputs across different dialog sections.
 * - The `FieldKey` type ensures only valid dialog sections can be used.
 * - `errorKeys` must only contain valid `ErrorKeys` defined in the validation system.
 * - When adding a new field or validation, ensure the corresponding validation
 *   method exists in the `Form` service (following the `markAs<ErrorKey>` convention).
 *
 * @example
 * ```ts
 * const loginFields = FORM_FIELDS_MAP.get('login');
 * loginFields?.forEach(field => {
 *   console.log(field.title, field.type, field.model, field.errorKeys);
 * });
 *
 * // Example of dynamic validation
 * const formService = inject(Form);
 * for (const field of loginFields ?? []) {
 *   if (field.errorKeys) {
 *     await formService.checkErrors(control, ...field.errorKeys);
 *   }
 * }
 * ```
 */
export const FORM_FIELDS_MAP: Map<FieldKey, FormField[]> = new Map([
  [
    'game_setting',
    [
      {
        field: 'size',
        title: 'Board Size',
        type: 'select',
        model: 'size',
        options: [3, 4, 5, 6, 7, 8, 9],
      },
      {
        field: 'opponent',
        title: 'Opponent Type',
        type: 'select',
        model: 'opponent',
        options: ['computer', 'player'],
      },
      {
        field: 'hardness',
        title: 'Difficulty',
        type: 'range',
        model: 'hardness',
        min: 1,
        max: 4,
      },
    ],
  ],
  [
    'save',
    [
      {
        field: 'gameName',
        title: 'Game Name',
        type: 'text',
        model: 'gameName',
        errorKeys: ['required'],
      },
    ],
  ],
  [
    'setting',
    [
      {
        field: 'primary',
        title: 'Primary Color',
        type: 'color',
        model: 'primaryColor',
      },
      {
        field: 'accent',
        title: 'Accent Color',
        type: 'color',
        model: 'accentColor',
      },
    ],
  ],
  [
    'login',
    [
      {
        field: 'email',
        title: 'Email Address',
        type: 'text',
        model: 'email',
        errorKeys: ['required', 'invalidEmail', 'emailInUse'],
      },
      {
        field: 'Password',
        title: 'Password',
        type: 'password',
        model: 'password',
        errorKeys: ['shortPassword', 'longPassword'],
      },
    ],
  ],
  [
    'registration',
    [
      {
        field: 'email',
        title: 'Email Address',
        type: 'text',
        model: 'email',
        errorKeys: ['required', 'invalidEmail', 'emailInUse'],
      },
      {
        field: 'Password',
        title: 'Password',
        type: 'password',
        model: 'password',
        errorKeys: ['shortPassword', 'longPassword'],
      },
      {
        field: 'rePassword',
        title: 'Confirm Password',
        type: 'password',
        model: 'rePassword',
        errorKeys: ['shortPassword', 'longPassword'],
      },
    ],
  ],
]);
