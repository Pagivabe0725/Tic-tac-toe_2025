import { TestBed } from '@angular/core/testing';

import { Auth } from '../auth.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Http } from '../http.service';
import { createUser } from '../../utils/test/functions/creators.functions';

/**
 * @fileoverview
 * Unit tests for the Auth service.
 *
 * This test suite verifies the core functionality of the Auth service, including:
 * - login and logout operations
 * - fetching the current session user
 * - user creation (signup)
 * - checking if an email is already used
 * - updating user information
 * - setting a user by ID
 * - verifying the current user's password
 * - managing the local user signal
 *
 * Each test ensures that the service correctly interacts with the backend via
 * HTTP requests, updates internal state signals, and handles both valid and
 * invalid responses.
 *
 * Spies are used on the Http service to mock HTTP requests and control returned values.
 * Asynchronous methods are tested using async/await to ensure proper sequencing and state updates.
 *
 * Scenarios covered:
 * - Valid and invalid backend responses
 * - User signal updates
 * - Password verification
 * - Signup response handling
 * - Concurrent state updates and proper fallback behavior
 */

describe('Auth (service)', () => {
  let service: Auth;
  let httpService: Http;
  let requestSpy: jasmine.Spy;
  const testUser = createUser(true);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(Auth);
    httpService = TestBed.inject(Http);
  });

  /**
   * Tests related to the login function.
   */
  describe('[login] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the login function returns the user object
     * when the HTTP response is valid.
     */
    it('Should return the user object when the response is valid', async () => {
      requestSpy.and.returnValue(Promise.resolve(testUser));

      const loginResult = await service.login('test@gmail.com', '123456');

      expect(loginResult).toEqual(testUser);
    });

    /**
     * Ensures that the login function returns undefined
     * when the HTTP response is invalid.
     */
    it('Should return undefined when the response is invalid', async () => {
      const loginResult = await service.login('test@gmail.com', '123456');

      expect(loginResult).toBeUndefined();
    });
  });

  /**
   * Tests for the fetchCurrentSessionUser function.
   */
  describe('[fetchCurrentSessionUser] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the function returns the user object
     * when the HTTP response contains a valid user.
     */
    it('Should return the user object when the response contains a valid user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));

      const result = await service['fetchCurrentSessionUser']();

      expect(result).toEqual(testUser);
    });

    /**
     * Ensures that the function returns undefined
     * when the HTTP response does not contain a valid user.
     */
    it('Should return undefined when the response does not contain a valid user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user2: testUser }));

      const result = await service['fetchCurrentSessionUser']();

      expect(result).toBeUndefined();
    });
  });

  /**
   * Tests for the logout function.
   */
  describe('[logout] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that logout returns true when the HTTP response indicates success.
     */
    it('Should return `true` when the response indicates success', async () => {
      requestSpy.and.returnValue(Promise.resolve({ result: true }));

      const result = await service['logout']();

      expect(result).toBeTrue();
    });

    /**
     * Ensures that logout returns undefined when the HTTP response is invalid.
     */
    it('Should return `undefined` when the response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve({ result: undefined }));

      const result = await service['logout']();

      expect(result).toBeUndefined();
    });
  });

  /**
   * Tests for the setCurrentUserIfExist function.
   */
  describe('[setCurrentUserIfExist] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the user is set when the HTTP response contains a valid user.
     */
    it('Should set the user when the response contains a valid user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));

      // Initially the user should be undefined
      expect(service['user']()).toBeUndefined();

      await service['setCurrentUserIfExist']();

      // Verify that the user has been set correctly
      expect(service['user']()).toEqual(testUser);
    });

    /**
     * Ensures that the user remains undefined when the HTTP response does not contain a valid user.
     */
    it('Should set the user to undefined when the response does not contain a valid user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user2: testUser }));

      // Initially the user should be undefined
      expect(service['user']()).toBeUndefined();

      await service['setCurrentUserIfExist']();

      // Verify that the user remains undefined
      expect(service['user']()).toBeUndefined();
    });
  });

  /**
   * Tests for the isUsedEmail function.
   */
  describe('[isUsedEmail] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the function returns true when the email is already used.
     */
    it('Should return `true` if the email is already used', async () => {
      requestSpy.and.returnValue(Promise.resolve({ result: true }));

      const result = await service['isUsedEmail']('test@gmail.com');

      expect(result).toBeTrue();
    });

    /**
     * Ensures that the function returns false when the email is not used.
     */
    it('Should return `false` if the email is not used', async () => {
      requestSpy.and.returnValue(Promise.resolve({ result: false }));

      const result = await service['isUsedEmail']('test@gmail.com');

      expect(result).toBeFalse();
    });

    /**
     * Ensures that the function returns false when the HTTP response is invalid.
     */
    it('Should return `false` if the response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve(undefined));

      const result = await service['isUsedEmail']('test@gmail.com');

      expect(result).toBeFalse();
    });
  });

  /**
   * Tests for the signup function.
   */
  describe('[signup] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the function returns the created user's id
     * when the signup response is valid.
     */
    it('Should return the `userId` when the response is valid', async () => {
      requestSpy.and.returnValue(Promise.resolve({ userId: testUser.userId }));

      const result = await service['signup'](
        'test@gmail.com',
        '123456',
        '123456'
      );

      expect(result?.userId).toBe(testUser.userId);
    });

    /**
     * Ensures that the function returns undefined
     * when the signup response is invalid.
     */
    it('Should return `undefined` when the response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve(undefined));

      const result = await service['signup'](
        'test@gmail.com',
        '123456',
        '123456'
      );

      expect(result).toBeUndefined();
    });
  });

  /**
   * Tests for the updateUser method.
   */
  describe('[updateUser] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the local user state is updated
     * when a valid backend response is received
     * and a user is already logged in.
     */
    it('Should update the current user when the backend response is valid', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));
      await service['setCurrentUserIfExist']();

      requestSpy.and.returnValue(Promise.resolve(testUser));

      await service['updateUser']({ ...testUser, userId: 'newUser1' });

      expect(service['user']()?.userId).toBe('newUser1');
    });

    /**
     * Ensures that no update happens when there is
     * no logged-in user, even if the backend responds successfully.
     */
    it('Should not update the user when no user is logged in', async () => {
      requestSpy.and.returnValue(Promise.resolve(testUser));

      await service['updateUser']({ ...testUser, userId: 'newUser1' });

      expect(service['user']()).toBe(undefined);
    });

    /**
     * Ensures that the local user state remains unchanged
     * when the backend update request fails.
     */
    it('Should not update the user when the backend response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));
      await service['setCurrentUserIfExist']();

      requestSpy.and.returnValue(Promise.resolve(undefined));

      await service['updateUser']({ ...testUser, userId: 'newUser1' });

      expect(service['user']()?.userId).toBe(testUser.userId);
    });
  });

  /**
   * Tests for the setUserById method.
   */
  describe('[setUserById] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the user signal is updated
     * when a valid user object is returned from the backend.
     */
    it('Should set the user when the backend response is valid', async () => {
      requestSpy.and.returnValue(Promise.resolve(testUser));

      await service['setUserById'](testUser.userId);

      expect(service['user']()).toEqual(testUser);
    });

    /**
     * Ensures that the user signal is not updated
     * when the backend response is invalid.
     */
    it('Should not set the user when the backend response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve(undefined));

      await service['setUserById'](testUser.userId);

      expect(service['user']()).toBe(undefined);
    });
  });

  /**
   * Tests for the isCurrentUserPassword method.
   */
  describe('[isCurrentUserPassword] function:', () => {
    beforeEach(() => {
      // Spy on the HTTP service request method
      requestSpy = spyOn(httpService, 'request');
    });

    /**
     * Ensures that the method returns undefined
     * when there is no logged-in user.
     */
    it('Should return undefined when no user is logged in', async () => {
      const result = await service['isCurrentUserPassword']('123456');

      expect(result).toBe(undefined);
    });

    /**
     * Ensures that the method returns true
     * when the provided password matches the current user's password.
     */
    it('Should return true when the password matches the current user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));
      await service['setCurrentUserIfExist']();

      requestSpy.and.returnValue(Promise.resolve({ isEqual: true }));

      const result = await service['isCurrentUserPassword']('123456');

      expect(result).toBeTrue();
    });

    /**
     * Ensures that the method returns false
     * when the provided password does not match the current user's password.
     */
    it('Should return false when the password does not match the current user', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));
      await service['setCurrentUserIfExist']();

      requestSpy.and.returnValue(Promise.resolve({ isEqual: false }));

      const result = await service['isCurrentUserPassword']('123456');

      expect(result).toBeFalse();
    });

    /**
     * Ensures that the method returns undefined
     * when the backend response is invalid.
     */
    it('Should return undefined when the backend response is invalid', async () => {
      requestSpy.and.returnValue(Promise.resolve({ user: testUser }));
      await service['setCurrentUserIfExist']();

      requestSpy.and.returnValue(Promise.resolve(undefined));

      const result = await service['isCurrentUserPassword']('123456');

      expect(result).toBe(undefined);
    });
  });
});
