/**
 * @interface User
 *
 * Represents a user entity as returned by the backend API.
 * Contains basic authentication info and game statistics.
 */
export interface User {
  /** Unique identifier for the user */
  userId: number;

  /** Email address of the user, used for login and notifications */
  email: string;

  /** Total number of games the user has won */
  winNumber: number;

  /** Total number of games the user has lost */
  loseNumber: number;
}
