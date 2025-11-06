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
  /** Injected authentication service */
  #auth: Auth = inject(Auth);

  /** Injected game component instance */
  #game: GameLogic = inject(GameLogic);

  #helper: Functions = inject(Functions);

  /**
   * A centralized map defining all available dialog form configurations.
   *
   * Each `FieldKey` corresponds to a specific dialog section
   * (e.g., `"game_setting"`, `"save"`, `"setting"`, `"login"`, `"registration"`),
   * and each section holds an array of `FormField` objects describing
   * the fields to be rendered in that form.
   *
   * Each `FormField` defines:
   * - `field`: Unique identifier of the input
   * - `title`: Display label for the field
   * - `type`: Input type (e.g., `"text"`, `"password"`, `"select"`, `"range"`, `"color"`)
   * - `model`: Name of the bound model property in the component or service
   * - `options` (optional): Allowed values for `select` fields
   * - `min` / `max` (optional): Numeric limits for `range` fields
   * - `errorKeys` (optional): Validation identifiers mapped to the form validation system
   *
   * @remarks
   * - This map serves as a **single source of truth** for all dialog-based forms.
   * - It allows for fully dynamic form generation using metadata instead of hardcoding inputs.
   * - Each key and model is type-safe, thanks to the `FieldKey` and `FormField` types.
   *
   * @example
   * ```ts
   * const fields = formTemplate.formFieldMap.get('login');
   * for (const field of fields ?? []) {
   *   console.log(field.title, field.type, field.model);
   * }
   * ```
   */

  /**
   * Computed map: mindig a legfrissebb GameLogic értékeket adja vissza
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
          },
          {
            field: 'opponent',
            title: 'Opponent Type',
            type: 'select',
            model: 'opponent',
            options: this.#auth.user() ? ['computer', 'player'] : ['player'],
            baseValue: this.#auth.user() ? this.#game.opponent() : 'player', 
          },
          {
            field: 'hardness',
            title: 'Difficulty',
            type: 'range',
            model: 'hardness',
            min: 1,
            max: 4,
            baseValue:  this.#game.hardness(),
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
          },
          {
            field: 'accent',
            title: 'Accent Color',
            type: 'color',
            model: 'accentColor',
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
          },
          {
            field: 'password',
            title: 'Password',
            type: 'password',
            model: 'password',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
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
          },
          {
            field: 'password',
            title: 'Password',
            type: 'password',
            model: 'password',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
          },
          {
            field: 'rePassword',
            title: 'Confirm Password',
            type: 'password',
            model: 'rePassword',
            errorKeys: ['required', 'shortPassword', 'longPassword'],
          },
        ],
      ],
    ]);
  });


  /**
   * Returns the map of form field configurations used by dialogs.
   *
   * @returns A `Map<FieldKey, FormField[]>` containing all form field definitions.
   */
  get formFieldMap(): Map<FieldKey, FormField[]> {
    return new Map(this.#formFieldMap())
  }

}




