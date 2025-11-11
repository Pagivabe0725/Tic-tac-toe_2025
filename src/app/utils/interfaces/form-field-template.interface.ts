import { FormFieldModel } from "../types/dialog-form-field-model.type";
import { ErrorKeys } from "../types/error-messages.type";

/**
 * Defines the structure of a single form field in a dialog.
 * 
 * @property field - Unique identifier of the field in the UI.
 * @property title - Human-readable label displayed in the form.
 * @property type - The type of input element (text, select, email, etc.).
 * @property model - Corresponding FormFieldModel used for data binding.
 * @property options - Optional array of selectable values for 'select' type fields.
 * @property min - Optional minimum value for 'range' type fields.
 * @property max - Optional maximum value for 'range' type fields.
 * @property errorKeys - Optional list of validation error keys to check for this field.
 * Each key must correspond to a method in the Form service
 * (e.g., 'invalidEmail' → markAsInvalidEmail).
 */
export interface FormField {
  field: string;
  title: string;
  type: 'select' | 'text' | 'email' | 'range' | 'color' | 'password';
  model: FormFieldModel;
  options?: string[] | number[];
  baseValue?:string | number;
  min?: number;
  max?: number;
  errorKeys?: ErrorKeys[];
  valueType: 'string' | 'number'
}