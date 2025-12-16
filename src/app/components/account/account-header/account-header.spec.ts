import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountHeader } from './account-header';
import {
  DebugElement,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { Http } from '../../../services/http.service';
import { Auth } from '../../../services/auth.service';
import { createUser } from '../../../utils/test/functions/creators.functions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { By } from '@angular/platform-browser';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';
import { User } from '../../../utils/interfaces/user.interface';
import {
  createUpdatePasswordMutation,
  createUpdateUserMutation,
} from '../../../utils/test/functions/graphql.function';

/**
 * @fileoverview
 * Unit tests focusing on the AccountHeader component’s DOM rendering and user action handling.
 *
 * The tests verify:
 * - Correct display of user statistics in the template
 * - Dialog opening behavior for changing password and email
 * - Proper GraphQL requests for password and email changes
 * - Success and error snackbar notifications
 * - Handling of undefined or invalid HTTP/GraphQL responses
 * - Graceful handling of thrown HTTP errors
 */

const actualUser = createUser(false);

/**
 * Mock authentication service that exposes a signal-based user object.
 * This is used to simulate an authenticated user inside the test environment.
 */
class MockAuth {
  user = signal(actualUser);
}

describe('AccountHeader', () => {
  /**
   * The AccountHeader component instance under test.
   * Provides access to methods and properties for unit testing.
   */
  let component: AccountHeader;

  /**
   * Angular test fixture for the AccountHeader component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<AccountHeader>;

  /**
   * DialogHandler service instance used to spy on dialog openings
   * and simulate user interactions in the test environment.
   */
  let dialogService: DialogHandler;

  /**
   * Initializes the testing module before each test.
   * Creates the component instance and injects required services.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountHeader, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Http, useFactory: () => new Http() },
        { provide: Auth, useClass: MockAuth },
        { provide: DialogHandler, useFactory: () => new DialogHandler() },
        { provide: SnackBarHandler, useFactory: () => new SnackBarHandler() },
      ],
    }).compileComponents();

    dialogService = TestBed.inject(DialogHandler);
    fixture = TestBed.createComponent(AccountHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * DOM-related tests verifying visual output.
   */
  describe('HTML:', () => {
    /**
     * Ensures that the user statistics (wins, losses, game count)
     * are correctly rendered in the HTML list.
     */
    it('Should display the correct user stats in the list', () => {
      const liElements = fixture.debugElement.queryAll(By.css('li'));
      const results = [
        actualUser.winNumber,
        actualUser.loseNumber,
        actualUser.game_count,
      ];
      expect(liElements.length).toEqual(results.length);
      for (let i = 0; i < liElements.length; i++) {
        const spans = liElements[i].queryAll(By.css('span'));
        const valueSpan = spans[1].nativeElement as HTMLSpanElement;
        expect(valueSpan.innerText.trim()).toEqual(String(results[i]).trim());
      }
    });
  });

  /**
   * Tests related to UI action buttons that open dialogs.
   */
  describe('Action buttons:', () => {
    let emailButton: DebugElement;
    let passwordButton: DebugElement;

    /**
     * Prepares spies on dialog openings and fetches button elements.
     */
    beforeEach(async () => {
      spyOn(dialogService, 'open');

      const buttons = fixture.debugElement.queryAll(
        By.css('.own-basic-button')
      );

      emailButton = buttons[1];
      passwordButton = buttons[0];
    });

    /**
     * Ensures that clicking the password button opens the password-change dialog.
     */
    it('Should open the dialog responsible for changing the password', async () => {
      passwordButton.triggerEventHandler('click');
      await fixture.detectChanges();
      expect(dialogService.open).toHaveBeenCalledOnceWith('password_change');
    });

    /**
     * Ensures that clicking the email button opens the email-change dialog.
     */
    it('Should open the dialog responsible for changing the email', async () => {
      emailButton.triggerEventHandler('click');
      await fixture.detectChanges();
      expect(dialogService.open).toHaveBeenCalledOnceWith('email_change');
    });
  });

  /**
   * Function-level behavioral tests for:
   * - changePassword()
   * - changeEmail()
   */
  describe('Component methods: ', () => {
    let HttpService: Http;
    let SnackbarService: SnackBarHandler;

    const passwordDialogResult = {
      password: '123456',
      newPassword: '654321',
      rePassword: '654321',
    };

    const emailDialogResult = {
      email: actualUser.email,
      newEmail: 'newemail@gmail.com',
    };

    /**
     * Injects Http and Snackbar services and sets spies before each test.
     */
    beforeEach(() => {
      HttpService = TestBed.inject(Http);
      SnackbarService = TestBed.inject(SnackBarHandler);
      spyOn(SnackbarService, 'addElement');
    });

    /**
     * Tests confirming that valid dialog results lead to successful
     * HTTP requests and snackbar notifications.
     */
    describe('Functions behavior after valid dialog result:', () => {
      /**
       * Ensures changePassword() successfully triggers the correct GraphQL mutation,
       * and displays a success snackbar.
       */
      it('[changePassword] should change the password successfully', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(passwordDialogResult)
        );

        spyOn(HttpService, 'request').and.returnValue(
          Promise.resolve({
            data: { updatePassword: { userId: actualUser.userId } },
          })
        );

        const body = createUpdatePasswordMutation(
          actualUser.userId,
          passwordDialogResult.password,
          passwordDialogResult.newPassword,
          passwordDialogResult.rePassword
        );

        await component['changePassword']();

        expect(dialogService.open).toHaveBeenCalledOnceWith('password_change');

        expect(HttpService.request).toHaveBeenCalledOnceWith(
          'post',
          'graphql/users',
          body,
          { maxRetries: 3, initialDelay: 200 }
        );

        expect(SnackbarService.addElement).toHaveBeenCalledOnceWith(
          'Password changed',
          false
        );
      });

      /**
       * Ensures changeEmail() successfully triggers the correct GraphQL mutation,
       * and displays a success snackbar.
       */
      it('[changeEmail] should change the email successfully', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(emailDialogResult)
        );

        spyOn(HttpService, 'request').and.returnValue(
          Promise.resolve({
            data: {
              updatedUser: {
                ...actualUser,
                email: emailDialogResult.newEmail,
              } as User,
            },
          })
        );

        const body = createUpdateUserMutation({
          ...actualUser,
          email: emailDialogResult.newEmail,
        });

        await component['changeEmail']();
        expect(dialogService.open).toHaveBeenCalledOnceWith('email_change');
        expect(HttpService.request).toHaveBeenCalledOnceWith(
          'post',
          'graphql/users',
          body,
          { maxRetries: 3, initialDelay: 100 }
        );
        expect(SnackbarService.addElement).toHaveBeenCalledOnceWith(
          'Email changed',
          false
        );
      });
    });

    /**
     * Tests verifying handling of undefined or invalid GraphQL responses.
     */
    describe('Functions behavior after invalid GraphQL response:', () => {
      /**
       * Ensures changePassword() handles undefined updatePassword value
       * and generates an error snackbar.
       */
      it('[changePassword] should handle undefined {data.updatePassword} http result', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve({
            passwordDialogResult,
          })
        );

        spyOn(HttpService, 'request').and.returnValue(
          Promise.resolve({ data: { errors: ['something wrong'] } })
        );

        await component['changePassword']();

        expect(dialogService.open).toHaveBeenCalledOnceWith('password_change');

        expect(SnackbarService.addElement).toHaveBeenCalledOnceWith(
          'Password changing failed',
          true
        );
      });

      /**
       * Ensures changeEmail() handles undefined updatedUser value
       * and generates an error snackbar.
       */
      it('[changeEmail] should handle undefined {data.updatedUser} http result', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(emailDialogResult)
        );

        spyOn(HttpService, 'request').and.returnValue(
          Promise.resolve({ data: { errors: ['something wrong'] } })
        );

        await component['changeEmail']();

        expect(dialogService.open).toHaveBeenCalledOnceWith('email_change');

        expect(SnackbarService.addElement).toHaveBeenCalledOnceWith(
          'Email changing failed',
          true
        );
      });
    });

    /**
     * Tests ensuring that thrown HTTP errors are caught,
     * and proper snackbar notifications are displayed.
     */
    describe('Functions behavior after HTTP error:', () => {
      /**
       * Ensures changePassword() handles thrown errors from HttpService.
       */
      it('[changePassword] should handle HTTP error', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(emailDialogResult)
        );

        spyOn(HttpService, 'request').and.throwError(new Error('HTTP fail'));

        await component['changePassword']();

        expect(dialogService.open).toHaveBeenCalledOnceWith('password_change');
        expect(SnackbarService.addElement).toHaveBeenCalledOnceWith(
          'Password changing failed',
          true
        );
      });

      /**
       * Ensures changeEmail() handles thrown errors from HttpService.
       */
      it('[changeEmail] should handle HTTP error', async () => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(emailDialogResult)
        );

        spyOn(HttpService, 'request').and.throwError(new Error('HTTP fail'));

        await component['changeEmail']();

        expect(dialogService.open).toHaveBeenCalledWith('email_change');
        expect(SnackbarService.addElement).toHaveBeenCalledWith(
          'Email changing failed',
          true
        );
      });
    });
  });
});
