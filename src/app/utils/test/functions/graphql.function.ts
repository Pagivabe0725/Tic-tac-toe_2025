import { User } from '../../interfaces/user.interface';

/**
 * Creates a GraphQL mutation payload for updating a user's email.
 *
 * - Produces a `query` string containing the `updatedUser` mutation.
 * - Injects the given user's `userId` and `email` into the `variables` object.
 *
 * @param user - User object providing the id and the new email value.
 * @returns GraphQL request body (query + variables) suitable for HttpService.request.
 */
export function createUpdateUserMutation(user: User): object {
  return {
    /** GraphQL mutation string for updating user email. */
    query: `
          mutation UpdateUser($userId: ID!, $email: String) {
            updatedUser(userId: $userId, email: $email) {
              userId
              email
              winNumber
              loseNumber
            }
          }
        `,
    /** Variables bound to the mutation. */
    variables: {
      userId: user.userId,
      email: user.email,
    },
  };
}

/**
 * Creates a GraphQL mutation payload for updating a user's password.
 *
 * - Produces a `query` string containing the `updatePassword` mutation.
 * - Uses `rePassword` as the `confirmPassword` variable to match backend naming.
 *
 * @param userId - The id of the user whose password is being updated.
 * @param password - The current password.
 * @param newPassword - The requested new password.
 * @param rePassword - Confirmation of the requested new password.
 * @returns GraphQL request body (query + variables) suitable for HttpService.request.
 */
export function createUpdatePasswordMutation(
  userId: string,
  password: string,
  newPassword: string,
  rePassword: string
): object {
  return {
    /** GraphQL mutation string for updating password. */
    query: `
          mutation updatePassword($userId: ID!, $password: String!, $newPassword: String!, $confirmPassword: String!) {
            updatePassword(
              userId: $userId,
              password: $password,
              newPassword: $newPassword,
              confirmPassword: $confirmPassword
            ) {
              userId
            }
          }
        `,
    /** Variables bound to the mutation. */
    variables: {
      userId: userId,
      password: password,
      newPassword: newPassword,
      confirmPassword: rePassword,
    },
  };
}
