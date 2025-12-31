import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, Signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { FormTemplate } from '../form-template.service';
import { Auth } from '../auth.service';

import {
  selectGameHardness,
  selectGameOpponent,
  selectGameSize,
} from '../../store/selectors/game-settings.selector';

import { FieldKey } from '../../utils/types/dialog-form-field-model.type';
import { HARNESS_VALUES } from '../../utils/constants/hardness.constant';
import { createUser } from '../../utils/test/functions/creators.functions';

/**
 * @fileoverview
 * Unit tests for the `FormTemplate` service.
 *
 * Covers:
 * - formFieldMap content (keys, titles, structures, buttons)
 * - game settings structure (reactive base values and auth-dependent options)
 * - getter helpers:
 *   - getButtonsByFieldKey
 *   - getStructureByFieldKey
 *   - getTitleByFieldKey
 */

class MockAuth {
  /** Current user signal used by FormTemplate. */
  user = signal<any | null>(null);
}

class MockStore {
  /** Backing signals for selectSignal() calls. */
  readonly sizeSig = signal<number>(4);
  readonly opponentSig = signal<'player' | 'computer'>('player');
  readonly hardnessSig = signal<number>(2);

  /** Minimal selector -> signal mapper for the service under test. */
  selectSignal<T>(selector: unknown): Signal<T> {
    if (selector === selectGameSize)
      return this.sizeSig as unknown as Signal<T>;
    if (selector === selectGameOpponent)
      return this.opponentSig as unknown as Signal<T>;
    if (selector === selectGameHardness)
      return this.hardnessSig as unknown as Signal<T>;

    return signal(undefined as unknown as T);
  }
}

describe('FormTemplate (service)', () => {
  /** Service under test. */
  let service: FormTemplate;

  /** Mocked Auth dependency (signal-based user state). */
  let authMock: MockAuth;

  /** Mocked Store dependency (signal-based selector values). */
  let storeMock: MockStore;

  /** Test user used when "logged in" state is needed. */
  const testUser = createUser(true);

  beforeEach(() => {
    authMock = new MockAuth();
    storeMock = new MockStore();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        FormTemplate,
        { provide: Auth, useValue: authMock as unknown as Auth },
        { provide: Store, useValue: storeMock as unknown as Store },
      ],
    });

    service = TestBed.inject(FormTemplate);
  });

  /**
   * Tests for the field map structure and helper getters.
   */
  describe('Field map + getters:', () => {
    /**
     * Ensures that the service exposes all expected form keys in the map.
     */
    it('Should expose all expected field keys', () => {
      const keys = [...service.formFieldMap.keys()] as FieldKey[];

      expect(keys).toContain('game_setting' as FieldKey);
      expect(keys).toContain('save' as FieldKey);
      expect(keys).toContain('setting' as FieldKey);
      expect(keys).toContain('login' as FieldKey);
      expect(keys).toContain('registration' as FieldKey);
      expect(keys).toContain('email_change' as FieldKey);
      expect(keys).toContain('password_change' as FieldKey);
    });

    /**
     * Verifies that `getTitleByFieldKey` returns the expected dialog title.
     */
    it('[getTitleByFieldKey] should return the correct title', () => {
      expect(service.getTitleByFieldKey('login' as FieldKey)).toBe('Login');
      expect(service.getTitleByFieldKey('setting' as FieldKey)).toBe(
        'Settings'
      );
    });

    /**
     * Verifies that `getStructureByFieldKey` returns the expected form fields for a key.
     */
    it('[getStructureByFieldKey] should return the correct structure', () => {
      const loginStructure = service.getStructureByFieldKey(
        'login' as FieldKey
      );

      expect(loginStructure.length).toBe(2);
      expect(loginStructure[0].model).toBe('email');
      expect(loginStructure[1].model).toBe('password');
    });

    /**
     * Verifies that `getButtonsByFieldKey` returns the expected button configuration.
     */
    it('[getButtonsByFieldKey] should return the correct buttons', () => {
      const buttons = service.getButtonsByFieldKey('login' as FieldKey)!;

      expect(buttons.length).toBe(3);
      expect(buttons[0].name).toBe('Login');
    });
  });

  /**
   * Tests for the `game_setting` structure behavior.
   */
  describe('[game_setting] structure:', () => {
    /**
     * If there is no logged-in user, the opponent field should only allow `player`
     * and fall back to `player` base value.
     */
    it('Should set opponent options to only `player` when user is not logged in', () => {
      authMock.user.set(null);

      const game = service.formFieldMap.get('game_setting' as FieldKey)!;
      const opponentField = game.structure.find((f) => f.model === 'opponent')!;

      expect(opponentField.options).toEqual(['player']);
      expect(opponentField.baseValue).toBe('player');
    });

    /**
     * If a user is logged in, the opponent field should include `computer`
     * and use the store value as base value.
     */
    it('Should include `computer` in opponent options when user is logged in', () => {
      authMock.user.set(testUser);
      storeMock.opponentSig.set('computer');

      const game = service.formFieldMap.get('game_setting' as FieldKey)!;
      const opponentField = game.structure.find((f) => f.model === 'opponent')!;

      expect(opponentField.options).toEqual(['computer', 'player']);
      expect(opponentField.baseValue).toBe('computer');
    });

    /**
     * Ensures that game setting fields read their base values from store signals
     * and that the hardness max matches the constants length.
     */
    it('Should set size and hardness base values from store signals', () => {
      storeMock.sizeSig.set(7);
      storeMock.hardnessSig.set(1);

      const game = service.formFieldMap.get('game_setting' as FieldKey)!;
      const sizeField = game.structure.find((f) => f.model === 'size')!;
      const hardnessField = game.structure.find((f) => f.model === 'hardness')!;

      expect(sizeField.baseValue).toBe(7);
      expect(hardnessField.baseValue).toBe(1);
      expect(hardnessField.max).toBe(HARNESS_VALUES.length);
    });
  });
});
