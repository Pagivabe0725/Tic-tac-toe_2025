import { User } from '../../interfaces/user.interface';

/**
 * Creates a GraphQL mutation object for updating a user's email.
 * @param user - The user object containing the ID and new email.
 * @returns An object suitable to be passed to HttpService.request for a GraphQL call.
 */
export function createUpdateUserMutation(user: User): object {
  return {
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
    variables: {
      userId: user.userId,
      email: user.email,
    },
  };
}

/**
 * Creates a GraphQL mutation object for updating a user's password.
 * @param userId - The ID of the user whose password is being updated.
 * @param password - The current password.
 * @param newPassword - The new password.
 * @param rePassword - Confirmation of the new password.
 * @returns An object suitable to be passed to HttpService.request for a GraphQL call.
 */
export function createUpdatePasswordMutation(
  userId: string,
  password: string,
  newPassword: string,
  rePassword: string
): object {
  return {
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
    variables: {
      userId: userId,
      password: password,
      newPassword: newPassword,
      confirmPassword: rePassword,
    },
  };
}
