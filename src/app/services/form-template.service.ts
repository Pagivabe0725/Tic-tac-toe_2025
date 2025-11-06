import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  FieldKey,
  FormField,
} from '../utils/types/dialog-form-field-model.type';
import { Auth } from './auth.service';
import { GameLogic } from './game-logic.service';
import { Functions } from './functions.service';

@Injectable({
  providedIn: 'root',
})
export class FormTemplate {
  /** Authentication service, injected for user info */
  #auth: Auth = inject(Auth);

  /** GameLogic service, injected for reactive game state */
  #game: GameLogic = inject(GameLogic);

  /** Helper functions service */
  #helper: Functions = inject(Functions);

  /**
   * Reactive map of form field configurations.
   *
   * This `computed` signal always returns the latest state of `GameLogic` signals,
   * ensuring that fields like board size, opponent type, and difficulty level
   * are always up-to-date when the form is rendered.
   *
   * Each `FieldKey` represents a specific form section, e.g., 'game_setting', 'login'.
   * Each `FormField` describes an individual input, its type, model binding,
   * options (for selects), min/max (for ranges), and optionally errorKeys.
   *
   * @example
   * ```ts
   * const fields = formTemplate.formFieldMap.get('game_setting');
   * console.log(fields[0].baseValue); // always returns the latest size
   * ```
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
            baseValue: this.#game.size(),
            valueType: 'number',
          },
          {
            field: 'opponent',
            title: 'Opponent Type',
            type: 'select',
            model: 'opponent',
            options: this.#auth.user() ? ['computer', 'player'] : ['player'],
            baseValue: this.#auth.user() ? this.#game.opponent() : 'player',
            valueType: 'string',
          },
          {
            field: 'hardness',
            title: 'Difficulty',
            type: 'range',
            model: 'hardness',
            min: 1,
            max: 4,
            baseValue: this.#game.hardness(),
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
   * The returned map always reflects the current state of `GameLogic` signals,
   * so reactive values like `size`, `opponent`, and `hardness` are always up-to-date.
   */
  get formFieldMap(): Map<FieldKey, FormField[]> {
    return new Map(this.#formFieldMap());
  }
}
