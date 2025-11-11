import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  FieldKey,
} from '../utils/types/dialog-form-field-model.type';
import { Auth } from './auth.service';
import { Store } from '@ngrx/store';
import { selectGameHardness, selectGameOpponent, selectGameSize } from '../store/selectors/game-state.selector';
import { FormField } from '../utils/interfaces/form-field-template.interface';

/**
 * @service FormTemplate
 *
 * Provides reactive, strongly-typed form field configurations for different
 * sections of the application (game settings, login, registration, theme settings, etc.).
 *
 * Each form field automatically updates its `baseValue` from the latest state
 * in the store or authentication service, making the form reactive to state changes.
 */
@Injectable({
  providedIn: 'root',
})
export class FormTemplate {
  /** Authentication service, injected for user info like available options */
  #auth: Auth = inject(Auth);

  /** NgRx Store service for reactive state selection */
  #store : Store = inject(Store)

  /**
   * Reactive map of form field configurations.
   *
   * This `computed` signal recalculates whenever its dependencies (store selectors, auth service)
   * change, ensuring that form fields always reflect the latest application state.
   *
   * Map keys (`FieldKey`) represent logical form sections.
   * Values (`FormField[]`) define individual form inputs, their type, model binding,
   * options (for select fields), range min/max, base value, and optional error keys.
   */
  #formFieldMap: Signal<Map<FieldKey, FormField[]>> = computed(() => {
    return new Map<FieldKey, FormField[]>([
      [
        'game_setting',
        [
          {
            field: 'size',
            title: 'Board Size',
            type: 'select',
            model: 'size',
            options: [3, 4, 5, 6, 7, 8, 9],
            // Reactive value from store
            baseValue:  this.#store.selectSignal(selectGameSize)(),
            valueType: 'number',
          },
          {
            field: 'opponent',
            title: 'Opponent Type',
            type: 'select',
            model: 'opponent',
            // Only show 'computer' if user is logged in
            options: this.#auth.user() ? ['computer', 'player'] : ['player'],
            baseValue: this.#store.selectSignal(selectGameOpponent)(),
            valueType: 'string',
          },
          {
            field: 'hardness',
            title: 'Difficulty',
            type: 'range',
            model: 'hardness',
            min: 1,
            max: 4,
            baseValue: this.#store.selectSignal(selectGameHardness)(),
            valueType: 'number',
          },
        ],
      ],
      [
        'save',
        [
          {
            field: 'gameName',
            title: 'Game Name',
            type: 'text',
            model: 'gameName',
            errorKeys: ['required'],
            valueType: 'string',
          },
        ],
      ],
      [
        'setting',
        [
          {
            field: 'primary',
            title: 'Primary Color',
            type: 'color',
            model: 'primaryColor',
            valueType: 'string',
          },
          {
            field: 'accent',
            title: 'Accent Color',
            type: 'color',
            model: 'accentColor',
            valueType: 'string',
          },
        ],
      ],
      [
        'login',
        [
          {
            field: 'email',
            title: 'Email Address',
            type: 'text',
            model: 'email',
            errorKeys: ['required', 'invalidEmail', 'emailDoesNotExist'],
            valueType: 'string',
          },
          {
            field: 'password',
            title: 'Password',
            type: 'password',
            model: 'password',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
            valueType: 'string',
          },
        ],
      ],
      [
        'registration',
        [
          {
            field: 'email',
            title: 'Email Address',
            type: 'text',
            model: 'email',
            errorKeys: ['required', 'invalidEmail', 'emailInUse'],
            valueType: 'string',
          },
          {
            field: 'password',
            title: 'Password',
            type: 'password',
            model: 'password',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
            valueType: 'string',
          },
          {
            field: 'rePassword',
            title: 'Confirm Password',
            type: 'password',
            model: 'rePassword',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
            valueType: 'string',
          },
        ],
      ],
    ]);
  });

  /**
   * Returns a fresh copy of the form field map.
   *
   * Consumers of this service should always use this getter to
   * prevent accidental mutation of the internal `computed` signal.
   *
   * @returns Map<FieldKey, FormField[]> - reactive form configuration map
   */
  get formFieldMap(): Map<FieldKey, FormField[]> {
    return new Map(this.#formFieldMap());
  }
}
