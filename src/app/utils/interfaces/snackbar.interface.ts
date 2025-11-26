/**
 * Interface describing the structure of a snackbar message.
 *
 * Properties:
 * - `id`: Unique identifier for this snackbar item.
 * - `content`: The text content to display in the snackbar.
 * - `duration`: Lifetime of the snackbar in ticks (used for auto-dismissal).
 * - `error`: Boolean flag indicating if the snackbar represents an error message.
 */
export interface snackbarTemplate {
  id: number;
  content: string;
  duration: number;
  error: boolean;
}
