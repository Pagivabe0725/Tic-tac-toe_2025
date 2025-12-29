import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection, signal } from '@angular/core';
import { FormError } from '../form-error.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AbstractControl, FormControl } from '@angular/forms';
import { ErrorKeys } from '../../utils/types/error-messages.type';
import { ERROR_MESSAGES } from '../../utils/constants/error-message.constant';
import { randomNumber } from '../../utils/test/functions/random-values.function';
import { Auth } from '../auth.service';
import { createUser } from '../../utils/test/functions/creators.functions';

/**
 * @fileoverview
 * Unit tests for the `FormError` service.
 *
 * Covers:
 * - Basic error utilities:
 *   - addErrorToControl: adds an error key and verifies it via getPrimaryError.
 *   - hasErrors: checks whether a control currently has any errors.
 *   - getPrimaryError: returns the first matching error message based on ERROR_MESSAGES order.
 *   - clearErrors: clears all errors from a control.
 *
 * - Marker functions (validation helpers):
 *   - markAsRequired
 *   - markAsInvalidEmail
 *   - markAsShortPassword / markAsLongPassword
 *   - markAsPasswordMismatch
 *   - markAsEmailInUse / markAsEmailDoesNotExist (async, via Auth.isUsedEmail)
 *   - markAsNotCurrentUserEmail (via Auth.user signal)
 *   - markAsNotCurrentUserPassword (async, via Auth.isCurrentUserPassword)
 *
 * - Error checking helpers:
 *   - checkErrorByName
 *   - checkErrors (iterates error keys and stops after the first applied error)
 *
 * Notes:
 * - Uses `HttpClientTestingModule` and zoneless change detection.
 * - Auth service dependencies are isolated with spies for predictable behavior.
 */

describe('FormError (service)', () => {
  let service: FormError;
  let authService: Auth;

  let testControl: AbstractControl<any, any, any>;
  let actualErrorKey: ErrorKeys;

  const testUser = createUser(true);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(FormError);
    authService = TestBed.inject(Auth);

    testControl = new FormControl();
    actualErrorKey = [...ERROR_MESSAGES.keys()][
      randomNumber(ERROR_MESSAGES.size)
    ];
  });

  /**
   * Tests for the `addErrorToControl` method.
   * Ensures that the specified error key is added to the provided form control
   * and can be retrieved via `getPrimaryError`.
   */
  describe('[addErrorToControl] function:', () => {
    /**
     * Adds the error to the control and verifies that it is set correctly.
     */
    it('Should add error to control', () => {
      console.log(actualErrorKey);
      service.addErrorToControl(testControl, actualErrorKey);
      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get(actualErrorKey)
      );
    });
  });

  /**
   * Tests for the form validation "marker" functions.
   * These helpers add / clear specific validation errors on a given control.
   */
  describe('Marker functions:', () => {
    /** Spy on the Auth service's isUsedEmail method. */
    let isUsedEmailSpy: jasmine.Spy;

    beforeEach(() => {
      testControl = new FormControl();
    });

    /**
     * Tests for validation marking methods in the form validation service.
     */
    describe('[markAsRequired] function:', () => {
      /**
       * Adds the `required` error to a control if its value is empty.
       */
      it('Should add `required` error to control', () => {
        service.markAsRequired(testControl);
        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('required')
        );
      });

      /**
       * Ensures that the `required` error is not added if the control has a value.
       */
      it('Should not add `required` error to control', () => {
        testControl.setValue('1');
        service.markAsRequired(testControl);
        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsInvalidEmail` form validation method.
     * Adds an `invalidEmail` error to the provided control if its value is not a valid email format.
     */
    describe('[markAsInvalidEmail] function:', () => {
      /**
       * Adds the `invalidEmail` error when the control value is not a valid email.
       */
      it('Should add `invalidEmail` error to control', () => {
        testControl.setValue('tesztemail');
        service.markAsInvalidEmail(testControl);
        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('invalidEmail')
        );
      });

      /**
       * Does not add the `invalidEmail` error if the control value is a valid email.
       */
      it('Should not add `invalidEmail` error to control', () => {
        testControl.setValue('teszt@email.com');
        service.markAsInvalidEmail(testControl);
        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsShortPassword` form validation method.
     * Adds a `shortPassword` error to the provided control if its value is shorter than the required length.
     */
    describe('[markAsShortPassword] function:', () => {
      /**
       * Adds the `shortPassword` error if the control value is too short.
       */
      it('Should add `shortPassword` error to control', () => {
        testControl.setValue('12345');
        service.markAsShortPassword(testControl);
        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('shortPassword')
        );
      });

      /**
       * Does not add the `shortPassword` error if the control value meets the length requirement.
       */
      it('Should not add `shortPassword` error to control', () => {
        testControl.setValue('123456');
        service.markAsShortPassword(testControl);
        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Adds the `longPassword` error if the control value exceeds the maximum allowed length.
     */
    it('[markAsLongPassword] should add `longPassword` error to control', () => {
      testControl.setValue('a'.repeat(100));
      service.markAsLongPassword(testControl);
      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get('longPassword')
      );
    });

    /**
     * Tests for the `markAsPasswordMismatch` form validation method.
     * Ensures that the confirm control (second parameter) receives a `passwordMismatch` error
     * when the reference and confirm controls have different values.
     */
    describe('[markAsPasswordMismatch] function:', () => {
      /**
       * Adds the `passwordMismatch` error to the confirm control
       * (always the second parameter) when the values of the reference and confirm controls do not match.
       */
      it('Should add `passwordMismatch` error to confirm control', () => {
        testControl.setValue('123456');
        const referenceControl = new FormControl();
        referenceControl.setValue('1234567');

        service.markAsPasswordMismatch(referenceControl, testControl);
        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('passwordMismatch')
        );
      });

      /**
       * Does not add the `passwordMismatch` error to the confirm control
       * (always the second parameter) if the reference and confirm controls match.
       */
      it('Should not add `passwordMismatch` error to confirm control', () => {
        testControl.setValue('123456');
        const referenceControl = new FormControl();
        referenceControl.setValue('123456');

        service.markAsPasswordMismatch(referenceControl, testControl);
        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsEmailInUse` form validation method.
     * Ensures that the control is marked with an `emailInUse` error
     * when the provided email is already registered, and not marked
     * when the email is available.
     */
    describe('[markAsEmailInUse] function:', () => {
      beforeEach(() => {
        isUsedEmailSpy = spyOn(authService, 'isUsedEmail');
      });

      /**
       * Adds the `emailInUse` error when the email is already used.
       */
      it('Should add `emailInUse` error to control', async () => {
        isUsedEmailSpy.and.returnValue(Promise.resolve(true));
        testControl.setValue('test@gmail.com');
        await service.markAsEmailInUse(testControl);
        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('emailInUse')
        );
      });

      /**
       * Does not add the `emailInUse` error if the email is not already used.
       */
      it('Should not add `emailInUse` error to control', async () => {
        isUsedEmailSpy.and.returnValue(Promise.resolve(false));
        testControl.setValue('test@gmail.com');
        await service.markAsEmailInUse(testControl);
        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsEmailDoesNotExist` marker function.
     * Ensures that the control gets the `emailDoesNotExist` error only when the email is not used.
     */
    describe('[markAsEmailDoesNotExist] function:', () => {
      /** Spy on `authService.isUsedEmail` to control the async result in tests. */
      beforeEach(() => {
        isUsedEmailSpy = spyOn(authService, 'isUsedEmail');
      });

      /**
       * Adds the `emailDoesNotExist` error when `isUsedEmail` resolves to `false`.
       */
      it('Should add `emailDoesNotExist` error to control', async () => {
        testControl.setValue('test@gmail.com');
        isUsedEmailSpy.and.returnValue(Promise.resolve(false));

        await service.markAsEmailDoesNotExist(testControl);

        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('emailDoesNotExist')
        );
      });

      /**
       * Does not add the `emailDoesNotExist` error when `isUsedEmail` resolves to `true`.
       */
      it('Should not add `emailDoesNotExist` error to control', async () => {
        testControl.setValue('test@gmail.com');
        isUsedEmailSpy.and.returnValue(Promise.resolve(true));

        await service.markAsEmailDoesNotExist(testControl);

        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsNotCurrentUserEmail` marker function.
     * Ensures that the control gets the `notCurrentUserEmail` error only when the entered email
     * is different from the current user's email.
     */
    describe('[markAsNotCurrentUserEmail] function:', () => {
      /** Spy on the `authService.user` signal getter to provide a stable test user. */
      let userSpy: jasmine.Spy;

      beforeEach(() => {
        userSpy = spyOnProperty(authService, 'user', 'get').and.returnValue(
          signal(testUser)
        );
      });

      /**
       * Adds the `notCurrentUserEmail` error when the control value is not the current user's email.
       */
      it('Should add `notCurrentUserEmail` error to control', () => {
        testControl.setValue('other@gmail.com');

        service.markAsNotCurrentUserEmail(testControl);

        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('notCurrentUserEmail')
        );
      });

      /**
       * Does not add the `notCurrentUserEmail` error when the control value matches the current user's email.
       */
      it('Should not add `notCurrentUserEmail` error to control', () => {
        testControl.setValue(testUser.email);

        service.markAsNotCurrentUserEmail(testControl);

        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });

    /**
     * Tests for the `markAsNotCurrentUserPassword` marker function.
     * Ensures that the control gets the `notCurrentUserPassword` error only when the provided
     * password is not the current user's password.
     */
    describe('[markAsNotCurrentUserPassword] function:', () => {
      /** Spy on `authService.isCurrentUserPassword` to control the async result in tests. */
      let passwordSpy: jasmine.Spy;

      beforeEach(() => {
        passwordSpy = spyOn(authService, 'isCurrentUserPassword');
      });

      /**
       * Adds the `notCurrentUserPassword` error when `isCurrentUserPassword` resolves to `false`.
       */
      it('Should add `notCurrentUserPassword` error to control', async () => {
        passwordSpy.and.returnValue(Promise.resolve(false));
        testControl.setValue('123456');

        await service.markAsNotCurrentUserPassword(testControl);

        expect(service.getPrimaryError(testControl)).toBe(
          ERROR_MESSAGES.get('notCurrentUserPassword')
        );
      });

      /**
       * Does not add the `notCurrentUserPassword` error when `isCurrentUserPassword` resolves to `true`.
       */
      it('Should not add `notCurrentUserPassword` error to control', async () => {
        passwordSpy.and.returnValue(Promise.resolve(true));
        testControl.setValue('123456');

        await service.markAsNotCurrentUserPassword(testControl);

        expect(service.getPrimaryError(testControl)).toBeUndefined();
      });
    });
  });

  /**
   * Tests for the `checkErrorByName` helper.
   * Ensures that the requested error key is applied to the control.
   */
  describe('[checkErrorByName] function:', () => {
    /**
     * Adds the specified error (`required`) to the control
     * and verifies it via `getPrimaryError`.
     */
    it('Should add specific error by name to the control', async () => {
      await service.checkErrorByName(testControl, 'required');

      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get('required')
      );
    });
  });

  /**
   * Tests for the `checkErrors` helper.
   * Ensures that it iterates error keys and stops after the first applied error.
   */
  describe('[checkErrors] function:', () => {
    /**
     * If the control already has errors after the first check,
     * the function should stop and not evaluate further error keys.
     */
    it('Should stop after the first error is applied', async () => {
      // Spy on the internal helper to track how many times it is called.
      const checkErrorByNameSpy = spyOn(
        service,
        'checkErrorByName'
      ).and.callFake(async () => {});

      // Force `hasErrors` to be true immediately -> should break after first iteration.
      const hasErrorsSpy = spyOn(service, 'hasErrors').and.returnValue(true);

      await service.checkErrors(testControl, 'required', 'invalidEmail');

      // Only the first error should be checked.
      expect(checkErrorByNameSpy).toHaveBeenCalledTimes(1);
      expect(checkErrorByNameSpy).toHaveBeenCalledWith(testControl, 'required');

      // Next errors should not be evaluated.
      expect(checkErrorByNameSpy).not.toHaveBeenCalledWith(
        testControl,
        'invalidEmail'
      );

      // Break condition should be evaluated once.
      expect(hasErrorsSpy).toHaveBeenCalledTimes(1);
    });

    /**
     * If the first check does not produce an error,
     * the function should continue until an error appears, then stop.
     */
    it('Should continue until an error is applied', async () => {
      // Spy on the internal helper to track call order and count.
      const checkErrorByNameSpy = spyOn(
        service,
        'checkErrorByName'
      ).and.callFake(async () => {});

      // First iteration: no errors -> continue.
      // Second iteration: errors present -> stop.
      const hasErrorsSpy = spyOn(service, 'hasErrors').and.returnValues(
        false,
        true
      );

      await service.checkErrors(
        testControl,
        'required',
        'invalidEmail',
        'shortPassword'
      );

      // Should check exactly the first two errors, then stop.
      expect(checkErrorByNameSpy).toHaveBeenCalledTimes(2);
      expect(checkErrorByNameSpy.calls.allArgs()).toEqual([
        [testControl, 'required'],
        [testControl, 'invalidEmail'],
      ]);

      // Third error should never be evaluated due to early break.
      expect(checkErrorByNameSpy).not.toHaveBeenCalledWith(
        testControl,
        'shortPassword'
      );

      // Break condition evaluated for each iteration executed.
      expect(hasErrorsSpy).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * Tests for the `hasErrors` helper.
   * Ensures that it returns `true` when the control has any errors, otherwise `false`.
   */
  describe('[hasErrors] function:', () => {
    /**
     * Returns `false` when the control has no errors set.
     */
    it('Should return false if the control has no errors', () => {
      testControl = new FormControl();

      expect(service.hasErrors(testControl)).toBeFalse();
    });

    /**
     * Returns `true` when the control has at least one error key.
     */
    it('Should return true if the control has errors', () => {
      testControl = new FormControl();
      testControl.setErrors({ required: true });

      expect(service.hasErrors(testControl)).toBeTrue();
    });

    /**
     * Returns `true` even if the error value is falsy,
     * because the check is based on existing error keys.
     */
    it('Should return true if the control has an error key with falsy value', () => {
      testControl = new FormControl();
      testControl.setErrors({ required: false });

      expect(service.hasErrors(testControl)).toBeTrue();
    });
  });

  /**
   * Tests for the `getPrimaryError` helper.
   * Ensures that it returns the first matching error message based on `ERROR_MESSAGES` order.
   */
  describe('[getPrimaryError] function:', () => {
    /**
     * Returns `undefined` when the control has no errors.
     */
    it('Should return undefined if the control has no errors', () => {
      testControl = new FormControl();

      expect(service.getPrimaryError(testControl)).toBeUndefined();
    });

    /**
     * Returns the mapped error message when the control has a known error key.
     */
    it('Should return the correct error message for a single known error', () => {
      testControl = new FormControl();
      testControl.setErrors({ required: true });

      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get('required')
      );
    });

    /**
     * If multiple errors exist, returns the first one according to `ERROR_MESSAGES` entry order.
     */
    it('Should return the primary error based on ERROR_MESSAGES order', () => {
      testControl = new FormControl();

      // Create two known keys from the map to avoid assuming order / names.
      const [firstKey, secondKey] = [...ERROR_MESSAGES.keys()].slice(0, 2) as [
        ErrorKeys,
        ErrorKeys
      ];

      testControl.setErrors({ [secondKey]: true, [firstKey]: true });

      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get(firstKey)
      );
    });

    /**
     * Ignores unknown error keys and returns the first known match (if any).
     */
    it('Should ignore unknown errors and return the first known error message', () => {
      testControl = new FormControl();

      const firstKey = [...ERROR_MESSAGES.keys()][0] as ErrorKeys;

      testControl.setErrors({ someUnknownError: true, [firstKey]: true });

      expect(service.getPrimaryError(testControl)).toBe(
        ERROR_MESSAGES.get(firstKey)
      );
    });
  });

  /**
   * Tests for the `clearErrors` helper.
   * Ensures that it removes all errors from the control.
   */
  describe('[clearErrors] function:', () => {
    /**
     * Clears the control errors when errors are present.
     */
    it('Should clear errors from the control', () => {
      testControl = new FormControl();
      testControl.setErrors({ required: true });

      service.clearErrors(testControl);

      expect(testControl.errors).toBeNull();
      expect(service.hasErrors(testControl)).toBeFalse();
    });
  });
});
