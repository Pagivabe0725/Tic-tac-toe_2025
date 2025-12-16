import { Component, inject, Signal } from '@angular/core';
import { User } from '../../../utils/interfaces/user.interface';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { Http } from '../../../services/http.service';
import { Auth } from '../../../services/auth.service';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';

/**
 * @component AccountHeader
 *
 * Provides the user account header functionality, including
 * displaying user information and allowing email and password updates.
 *
 * Uses DialogHandler to open reactive dialogs for changing email and password.
 * Uses Http service to send GraphQL mutations to the backend.
 * Uses Auth service to update the current user signal.
 * Uses SnackBarHandler to show success or error messages.
 */
@Component({
  selector: 'section[appAccountHeader]',
  imports: [],
  templateUrl: './account-header.html',
  styleUrl: './account-header.scss',
})
export class AccountHeader {
  /** Dialog handler service for opening modals */
  #dialogHandler: DialogHandler = inject(DialogHandler);

  /** Snackbar service for showing feedback messages */
  #snackbar: SnackBarHandler = inject(SnackBarHandler);

  /** Http service for backend communication */
  #http: Http = inject(Http);

  /** Auth service to access and update the current user */
  #auth: Auth = inject(Auth);

  /** Signal to access the current user reactively */
  get user(): Signal<User> {
    return this.#auth.user as Signal<User>;
  }

  /**
   * Opens the "Change Email" dialog and updates the user's email.
   *
   * - Opens a reactive dialog via DialogHandler.
   * - Sends a GraphQL mutation to update the email on the backend.
   * - Updates the Auth service's user signal on success.
   * - Shows a snackbar notification indicating success or failure.
   */
  protected async changeEmail(): Promise<void> {
    const dialogResult = await this.#dialogHandler.open<
      { email: string; newEmail: string } | 'CLOSE_EVENT'
    >('email_change');

    if (dialogResult && dialogResult !== 'CLOSE_EVENT') {
      const body = {
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
          userId: this.#auth.user()!.userId,
          email: dialogResult.newEmail,
        },
      };

      try {
        const result = await this.#http.request<{
          data: { updatedUser: User };
        }>('post', 'graphql/users', body, { initialDelay: 100, maxRetries: 3 });

        if (result && result.data.updatedUser) {
          /** Update the current user signal on successful email change */
          this.#auth.user = result.data.updatedUser;
          this.#snackbar.addElement('Email changed', false);
        } else {
          /** Show error if mutation did not return updated user */
          this.#snackbar.addElement('Email changing failed', true);
        }
      } catch (error) {
        /** Show error if the request fails */
        this.#snackbar.addElement('Email changing failed', true);
      }
    }
  }

  /**
   * Opens the "Change Password" dialog and updates the user's password.
   *
   * - Opens a reactive dialog via DialogHandler.
   * - Sends a GraphQL mutation to update the password on the backend.
   * - Shows a snackbar notification indicating success or failure.
   */
  protected async changePassword(): Promise<void> {
    const dialogResult = await this.#dialogHandler.open<
      | { password: string; newPassword: string; rePassword: string }
      | 'CLOSE_EVENT'
    >('password_change');

    if (dialogResult && dialogResult !== 'CLOSE_EVENT') {
      const body = {
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
          userId: this.#auth.user()!.userId,
          password: dialogResult.password + '',
          newPassword: dialogResult.newPassword + '',
          confirmPassword: dialogResult.rePassword + '',
        },
      };

      try {
        const result = await this.#http.request<{
          data: { updatePassword: User };
        }>('post', 'graphql/users', body, {
          maxRetries: 3,
          initialDelay: 200,
        });

        if (result && !!result.data.updatePassword) {
          /** Show success notification */
          this.#snackbar.addElement('Password changed', false);
        } else {
          /** Show error notification if mutation did not succeed */
          this.#snackbar.addElement('Password changing failed', true);
        }
      } catch (error) {
        /** Show error notification if request fails */
        this.#snackbar.addElement('Password changing failed', true);
      }
    }
  }
}
