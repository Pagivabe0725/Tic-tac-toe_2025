
import { FORM_FIELD_MODELS } from "../constants/dialog-form-field-model.constant";
import { DialogContent } from "./dialog-content.type";

/**
 * Represents all possible model identifiers for dialog form fields.
 * These are used to map the form input to its corresponding data property.
 */
export type FormFieldModel = typeof FORM_FIELD_MODELS[number];

/**
 * Represents the valid keys for dialog form sections.
 * Excludes undefined to ensure type safety when accessing FORM_FIELDS_MAP.
 */
export type FieldKey = NonNullable<DialogContent>;
