/**
 * Array of all form field keys used in dynamic forms.
 *
 * These constants represent the models for the various input fields
 * across game settings, user authentication, email/password updates,
 * and gameplay configuration. The `as const` assertion ensures that
 * each value is treated as a literal type.
 *
 * Included fields:
 * - `hardness`: Game difficulty level
 * - `primaryColor`: Primary theme color
 * - `accentColor`: Accent theme color
 * - `gameName`: Name of the current game
 * - `email`: User email for login/registration
 * - `password`: User password
 * - `rePassword`: Password confirmation
 * - `newEmail`: New email for email update forms
 * - `newPassword`: New password for password update forms
 * - `opponent`: Selected opponent type
 * - `size`: Board or game size
 */
export const FORM_FIELD_MODELS = [
  'hardness',
  'primaryColor',
  'accentColor',
  'gameName',
  'email',
  'password',
  'rePassword',
  'opponent',
  'size',
  'newEmail',
  'newPassword'
] as const;
