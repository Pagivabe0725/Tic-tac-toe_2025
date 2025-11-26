/**
 * List of all supported AI difficulty levels.
 * Declared as `const` so TypeScript infers a readonly tuple,
 * allowing strict type checking across the application.
 */
export const HARNESS_VALUES = ['very-easy', 'easy', 'medium', 'hard'] as const;
